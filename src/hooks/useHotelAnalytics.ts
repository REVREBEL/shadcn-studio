import { useState, useEffect, useCallback } from 'react';
import * as duckdb from '@duckdb/duckdb-wasm';

// Define the shape of our summary statistics
// Marking fields as optional/nullable to handle potential NULL results from SQL aggregations
export interface HotelSummaryStats {
  property_name: string;
  rooms_cy?: number | null;
  revenue_cy?: number | null;
  rooms_ly_actual?: number | null;
  rev_ly_actual?: number | null;
  rev_budget?: number | null;
  rooms_budget?: number | null;
  available_rooms?: number | null;
  occ_cy?: number | null;
  occ_py?: number | null;
  occ_budget?: number | null;
  adr_cy?: number | null;
  adr_py?: number | null;
  adr_budget?: number | null;
  revpar_cy?: number | null;
  revpar_py?: number | null;
  revpar_budget?: number | null;
  occ_var?: number | null;
  adr_var?: number | null;
  revpar_var?: number | null;
  rev_to_budget?: number | null;
  budget_reach_pct?: number | null;
}

// Singleton for DuckDB WASM instance
let dbPromise: Promise<duckdb.AsyncDuckDB> | null = null;

async function getDuckDB() {
  if (dbPromise) return dbPromise;

  dbPromise = (async () => {
    try {
      // Use same-origin assets to avoid cross-origin Worker restrictions.
      const localBundles: duckdb.DuckDBBundles = {
        mvp: {
          mainModule: '/duckdb/duckdb-mvp.wasm',
          mainWorker: '/duckdb/duckdb-browser-mvp.worker.js',
        },
        eh: {
          mainModule: '/duckdb/duckdb-eh.wasm',
          mainWorker: '/duckdb/duckdb-browser-eh.worker.js',
        },
      };
      const bundle = await duckdb.selectBundle(localBundles);
      const worker = new Worker(bundle.mainWorker!);
      const logger = new duckdb.ConsoleLogger();
      const db = new duckdb.AsyncDuckDB(logger, worker);

      await db.instantiate(bundle.mainModule, bundle.pthreadWorker);
      return db;
    } catch (err) {
      // Reset singleton on failure to allow retries
      dbPromise = null;
      throw err;
    }
  })();

  return dbPromise;
}

export function useHotelAnalytics() {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;
    getDuckDB()
      .then(() => {
        if (mounted) setIsReady(true);
      })
      .catch((err: unknown) => {
        if (!mounted) return;
        if (err instanceof Error) {
          setError(err);
        } else {
          setError(new Error(typeof err === "string" ? err : "Failed to initialize DuckDB"));
        }
      });
    return () => { mounted = false; };
  }, []);

  /**
   * Retrieves summary statistics for a given hotel and date range from the 'Current' snapshot.
   */
  const getSummaryStats = useCallback(
    async (hotelName: string, year: number, month: number): Promise<HotelSummaryStats | null> => {
      if (!isReady) throw new Error("DuckDB is not ready yet.");

      let conn: duckdb.AsyncDuckDBConnection | null = null;
      try {
        const db = await getDuckDB();
        conn = await db.connect();

        const parquetUrl = '/data/dashboard_current.parquet';

        // Basic escaping of hotelName to mitigate simple string injection
        const escapedHotelName = hotelName.replace(/'/g, "''");

        const query = `
          SELECT
            property_name,
            SUM(rooms_cy) as rooms_cy,
            SUM(revenue_cy) as revenue_cy,
            SUM(rooms_ly_actual) as rooms_ly_actual,
            SUM(rev_ly_actual) as rev_ly_actual,
            SUM(rev_budget) as rev_budget,
            SUM(rooms_budget) as rooms_budget,
            SUM(available_rooms) as available_rooms,
            -- Recalculate ratios over the entire month to ensure correct weighted averages
            SUM(rooms_cy) / NULLIF(SUM(available_rooms), 0) as occ_cy,
            SUM(rooms_ly_actual) / NULLIF(SUM(available_rooms), 0) as occ_py,
            SUM(rooms_budget) / NULLIF(SUM(available_rooms), 0) as occ_budget,
            SUM(revenue_cy) / NULLIF(SUM(rooms_cy), 0) as adr_cy,
            SUM(rev_ly_actual) / NULLIF(SUM(rooms_ly_actual), 0) as adr_py,
            SUM(rev_budget) / NULLIF(SUM(rooms_budget), 0) as adr_budget,
            SUM(revenue_cy) / NULLIF(SUM(available_rooms), 0) as revpar_cy,
            SUM(rev_ly_actual) / NULLIF(SUM(available_rooms), 0) as revpar_py,
            SUM(rev_budget) / NULLIF(SUM(available_rooms), 0) as revpar_budget,

            -- Variances
            (SUM(rooms_cy) / NULLIF(SUM(available_rooms), 0)) - (SUM(rooms_ly_actual) / NULLIF(SUM(available_rooms), 0)) as occ_var,
            (SUM(revenue_cy) / NULLIF(SUM(rooms_cy), 0)) - (SUM(rev_ly_actual) / NULLIF(SUM(rooms_ly_actual), 0)) as adr_var,
            (SUM(revenue_cy) / NULLIF(SUM(available_rooms), 0)) - (SUM(rev_ly_actual) / NULLIF(SUM(available_rooms), 0)) as revpar_var,
            SUM(rev_budget) - SUM(revenue_cy) as rev_to_budget,
            SUM(revenue_cy) / NULLIF(SUM(rev_budget), 0) as budget_reach_pct
          FROM read_parquet('${parquetUrl}')
          WHERE property_name = '${escapedHotelName}'
            AND date_part('year', stay_date) = ${Number(year)}
            AND date_part('month', stay_date) = ${Number(month)}
          GROUP BY property_name;
        `;

        const result = await conn.query(query);

        if (result.numRows === 0) return null;

        const row = result.get(0);
        return row ? (row.toJSON() as HotelSummaryStats) : null;
      } finally {
        if (conn) {
          await conn.close();
        }
      }
    },
    [isReady]
  );

  return { isReady, error, getSummaryStats };
}

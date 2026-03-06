import { BigQuery } from '@google-cloud/bigquery';
import * as duckdb from 'duckdb';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import { loadEnvConfig } from '@next/env';

// Load environment variables from .env
const projectDir = process.cwd();
loadEnvConfig(projectDir);

let bqConfig = {};

// Try reading credentials dynamically using 1Password CLI
try {
  console.log('Fetching Google Service Account credentials via 1Password CLI...');
  const opUri = process.env.BQ_SERVICE_ACCOUNT_OP_URI;
  if (!opUri) {
    throw new Error('BQ_SERVICE_ACCOUNT_OP_URI is not defined in .env');
  }
  // Note: Ensure the 1Password CLI (op) is authenticated and available in your environment.
  const credentialJson = execSync(`op read "${opUri}" --no-newline`, { encoding: 'utf8' });
  bqConfig = { credentials: JSON.parse(credentialJson) };
} catch (error: any) {
  console.warn("Could not read credentials from 1Password. Falling back to Application Default Credentials or GOOGLE_APPLICATION_CREDENTIALS.", error.message);
}

// Initialize BigQuery client
const bq = new BigQuery(bqConfig);

// Initialize DuckDB in memory
const db = new duckdb.Database(':memory:');

async function runQueryToParquet(db: duckdb.Database, bq: BigQuery, query: string, outputFilename: string) {
  console.log(`\nExecuting BigQuery for ${outputFilename}...`);
  const [job] = await bq.createQueryJob({ query, location: 'us-central1' });
  const [rows] = await job.getQueryResults();

  console.log(`Fetched ${rows.length} rows for ${outputFilename}.`);
  if (rows.length === 0) {
    console.log(`No data found for ${outputFilename}. Skipping.`);
    return;
  }

  const publicDataDir = path.join(process.cwd(), 'public', 'data');
  const tempJsonPath = path.join(process.cwd(), `temp_${outputFilename}_bq_data.json`);
  const outputPath = path.join(publicDataDir, outputFilename);

  if (!fs.existsSync(publicDataDir)) {
    fs.mkdirSync(publicDataDir, { recursive: true });
  }

  // Handle BigQuery's Date formats automatically (BigQuery DATE objects stringify to {value: '...'})
  const jsonND = rows.map(r => {
    const row = { ...r } as any;
    for (const key in row) {
      // Flatten BigQuery Date/Datetime/Timestamp objects
      if (row[key] && typeof row[key] === 'object' && 'value' in row[key]) {
        row[key] = row[key].value;
      }
    }
    return JSON.stringify(row);
  }).join('\n');
  fs.writeFileSync(tempJsonPath, jsonND);

  console.log(`Converting data to ${outputFilename} via DuckDB...`);

  return new Promise<void>((resolve, reject) => {
    db.run(`
      COPY (
        SELECT * FROM read_json_auto('${tempJsonPath}')
      ) TO '${outputPath}' (FORMAT PARQUET);
    `, (err: any) => {
      if (fs.existsSync(tempJsonPath)) fs.unlinkSync(tempJsonPath);

      if (err) {
        console.error(`Error generating ${outputFilename}:`, err);
        reject(err);
      } else {
        console.log(`✅ Successfully saved Parquet data to:\n${outputPath}`);
        resolve();
      }
    });
  });
}

async function syncData() {
  const dataset = 'devrebel-big-query-database.dev_hotel_analytics';

  // 1. Current Snapshot Query for KPI Dashboards
  const currentQuery = `
    WITH seg_totals AS (
      SELECT
        property_name,
        stay_date,
        SUM(rooms_otb) as rooms_otb,
        SUM(rev_otb) as rev_otb,
        SUM(rooms_ly_actual) as rooms_ly_actual,
        SUM(rev_ly_actual) as rev_ly_actual,
        SUM(rooms_budget) as rooms_budget,
        SUM(rev_budget) as rev_budget
      FROM \`${dataset}.vw_pace_segment_current\`
      WHERE stay_date BETWEEN '2025-01-01' AND '2025-12-31'
      GROUP BY property_name, stay_date
    ),
    cap_totals AS (
      SELECT
        property_name,
        stay_date,
        SUM(available_rooms) as available_rooms
      FROM \`${dataset}.vw_pace_property_current\`
      WHERE stay_date BETWEEN '2025-01-01' AND '2025-12-31'
      GROUP BY property_name, stay_date
    )
    SELECT
      seg_totals.property_name,
      seg_totals.stay_date,

      seg_totals.rooms_otb as rooms_cy,
      seg_totals.rev_otb as revenue_cy,
      seg_totals.rooms_ly_actual as rooms_ly_actual,
      seg_totals.rev_ly_actual as rev_ly_actual,
      seg_totals.rev_budget as rev_budget,
      seg_totals.rooms_budget as rooms_budget,
      cap_totals.available_rooms as available_rooms,

      -- Calculated Metrics
      (seg_totals.rooms_otb / nullif(cap_totals.available_rooms, 0)) as occ_cy,
      (seg_totals.rooms_ly_actual / nullif(cap_totals.available_rooms, 0)) as occ_py,
      (seg_totals.rooms_budget / nullif(cap_totals.available_rooms, 0)) as occ_budget,
      (seg_totals.rev_otb / nullif(seg_totals.rooms_otb, 0)) as adr_cy,
      (seg_totals.rev_ly_actual / nullif(seg_totals.rooms_ly_actual, 0)) as adr_py,
      (seg_totals.rev_budget / nullif(seg_totals.rooms_budget, 0)) as adr_budget,
      (seg_totals.rev_otb / nullif(cap_totals.available_rooms, 0)) as revpar_cy,
      (seg_totals.rev_ly_actual / nullif(cap_totals.available_rooms, 0)) as revpar_py,
      (seg_totals.rev_budget / nullif(cap_totals.available_rooms, 0)) as revpar_budget,

      -- Variances
      ((seg_totals.rooms_otb / nullif(cap_totals.available_rooms, 0)) - (seg_totals.rooms_ly_actual / nullif(cap_totals.available_rooms, 0))) as occ_var,
      ((seg_totals.rev_otb / nullif(seg_totals.rooms_otb, 0)) - (seg_totals.rev_ly_actual / nullif(seg_totals.rooms_ly_actual, 0))) as adr_var,
      ((seg_totals.rev_otb / nullif(cap_totals.available_rooms, 0)) - (seg_totals.rev_ly_actual / nullif(cap_totals.available_rooms, 0))) as revpar_var,
      ((seg_totals.rooms_budget / nullif(cap_totals.available_rooms, 0)) - (seg_totals.rooms_otb / nullif(cap_totals.available_rooms, 0))) as occ_budget_var,
      ((seg_totals.rev_budget / nullif(seg_totals.rooms_budget, 0)) - (seg_totals.rev_otb / nullif(seg_totals.rooms_otb, 0))) as adr_budget_var,
      ((seg_totals.rev_budget / nullif(cap_totals.available_rooms, 0)) - (seg_totals.rev_otb / nullif(cap_totals.available_rooms, 0))) as revpar_budget_var,
      (seg_totals.rooms_otb - seg_totals.rooms_ly_actual) as rooms_var,
      (seg_totals.rev_otb - seg_totals.rev_ly_actual) as revenue_var,
      (seg_totals.rooms_budget - seg_totals.rooms_otb) as rooms_budget_var,
      (seg_totals.rev_budget - seg_totals.rev_otb) as revenue_budget_var,
      (seg_totals.rev_budget - seg_totals.rev_otb) as rev_to_budget,
      (seg_totals.rev_otb / nullif(seg_totals.rev_budget, 0)) as budget_reach_pct
    FROM seg_totals
    LEFT JOIN cap_totals
      ON seg_totals.property_name = cap_totals.property_name
      AND seg_totals.stay_date = cap_totals.stay_date;
  `;

  // 2. Trend Snapshot Query for Historically Paced Data
  const trendQuery = `
    WITH seg_totals AS (
      SELECT
        property_name,
        snapshot_date,
        stay_date,
        SUM(rooms_otb) as rooms_otb,
        SUM(rev_otb) as rev_otb,
        SUM(rooms_ly_actual) as rooms_ly_actual,
        SUM(rev_ly_actual) as rev_ly_actual,
        SUM(rooms_budget) as rooms_budget,
        SUM(rev_budget) as rev_budget
      FROM \`${dataset}.vw_pace_segment\`
      WHERE stay_date BETWEEN '2025-01-01' AND '2025-12-31'
        AND snapshot_date >= '2024-06-01'
      GROUP BY property_name, stay_date, snapshot_date
    ),
    cap_totals AS (
      SELECT
        property_name,
        snapshot_date,
        stay_date,
        SUM(available_rooms) as available_rooms
      FROM \`${dataset}.vw_pace_property\`
      WHERE stay_date BETWEEN '2025-01-01' AND '2025-12-31'
        AND snapshot_date >= '2024-06-01'
      GROUP BY property_name, stay_date, snapshot_date
    )
    SELECT
      seg_totals.property_name,
      seg_totals.snapshot_date,
      seg_totals.stay_date,

      seg_totals.rooms_otb as rooms_cy,
      seg_totals.rev_otb as revenue_cy,
      seg_totals.rooms_ly_actual as rooms_ly_actual,
      seg_totals.rev_ly_actual as rev_ly_actual,
      seg_totals.rev_budget as rev_budget,
      seg_totals.rooms_budget as rooms_budget,
      cap_totals.available_rooms as available_rooms,

      -- Calculated Metrics
      (seg_totals.rooms_otb / nullif(cap_totals.available_rooms, 0)) as occ_cy,
      (seg_totals.rooms_ly_actual / nullif(cap_totals.available_rooms, 0)) as occ_py,
      (seg_totals.rooms_budget / nullif(cap_totals.available_rooms, 0)) as occ_budget,
      (seg_totals.rev_otb / nullif(seg_totals.rooms_otb, 0)) as adr_cy,
      (seg_totals.rev_ly_actual / nullif(seg_totals.rooms_ly_actual, 0)) as adr_py,
      (seg_totals.rev_budget / nullif(seg_totals.rooms_budget, 0)) as adr_budget,
      (seg_totals.rev_otb / nullif(cap_totals.available_rooms, 0)) as revpar_cy,
      (seg_totals.rev_ly_actual / nullif(cap_totals.available_rooms, 0)) as revpar_py,
      (seg_totals.rev_budget / nullif(cap_totals.available_rooms, 0)) as revpar_budget
    FROM seg_totals
    LEFT JOIN cap_totals
      ON seg_totals.property_name = cap_totals.property_name
      AND seg_totals.stay_date = cap_totals.stay_date
      AND seg_totals.snapshot_date = cap_totals.snapshot_date;
  `;

  await runQueryToParquet(db, bq, currentQuery, 'dashboard_current.parquet');
  await runQueryToParquet(db, bq, trendQuery, 'dashboard_trend.parquet');
}

syncData().catch(console.error);

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useMemo, useState, useCallback } from "react"
import { EllipsisIcon , Settings2 , FunnelX} from "lucide-react"
import { type ColumnDef, createColumnHelper, getCoreRowModel, getPaginationRowModel, getSortedRowModel, type PaginationState, type SortingState, useReactTable, } from "@tanstack/react-table"
import { DataGrid, DataGridContainer } from "@/components/ui/data-grid"
import { DataGridColumnVisibility } from "@/components/ui/data-grid-column-visibility"
import { DataGridColumnHeader } from "@/components/ui/data-grid-column-header"
import { DataGridTable } from "@/components/ui/data-grid-table"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { DataGridPagination } from "@/components/ui/data-grid-pagination"
import { DataGridTableRowSelect, DataGridTableRowSelectAll, } from "@/components/ui/data-grid-table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu"
import { Filters, type Filter, type FilterFieldConfig } from "@/components/ui/filters"
import { Input } from "@/components/ui/input"
import { roomstransientData } from './data';

// Row actions component
function RowActions({
  row: _row
}: {
  row: any
}) {
  return (<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<div className="flex justify-end">
					<Button
						size="icon"
						variant="ghost"
						className="shadow-none"
						aria-label="Edit item"
					>
						<EllipsisIcon size={16} aria-hidden="true" />
					</Button>
				</div>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuGroup>
					<DropdownMenuItem>
						<span>Edit</span>
						<DropdownMenuShortcut>⌘E</DropdownMenuShortcut>
					</DropdownMenuItem>
					<DropdownMenuItem>
						<span>Duplicate</span>
						<DropdownMenuShortcut>⌘D</DropdownMenuShortcut>
					</DropdownMenuItem>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					<DropdownMenuItem>
						<span>Archive</span>
						<DropdownMenuShortcut>⌘A</DropdownMenuShortcut>
					</DropdownMenuItem>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuItem className="text-destructive focus:text-destructive">
					<span>Delete</span>
					<DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>);
}
export interface RoomstransientData {
  segmentView: string;
  occupancy: number;
  rooms: number;
  varSTLY: number;
  varPriorYear: number;
  varBudget: number;
  varForecast: number;
  aDR: number;
  revenue: number;
}
export default function RoomstransientTable() {
  const [pagination, setPagination] = useState < PaginationState > ({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState < SortingState > ([]);
  const [filters, setFilters] = useState < Filter[] > ([]);
  const columnHelper = createColumnHelper < RoomstransientData > ()
  const columns = [
    columnHelper.display({
      id: 'select',
      header: () => <DataGridTableRowSelectAll />,
      cell: ({
        row
      }) => <DataGridTableRowSelect row={row} />,
      size: 35,
      enableSorting: false,
      enableHiding: false,
      enableResizing: false,
      enablePinning: false,
    }),
    columnHelper.accessor('segmentView', {
      header: ({
        column
      }) => <DataGridColumnHeader title="Segment View" column={column} />,
      cell: ({
        getValue
      }) => <div className="font-medium">{String(getValue() || "")}</div>,
      size: 180,
      enableSorting: true,
      enableHiding: true,
      enableResizing: false,
      enablePinning: true,
    }),
    columnHelper.accessor('occupancy', {
      header: ({ column }) => <DataGridColumnHeader title="Occupancy" column={column} />,
      cell: ({ getValue }) => {
        const value = parseFloat(String(getValue() || 0));
        return (
          <div>
            {new Intl.NumberFormat("en-US", {
              style: "percent",
              minimumFractionDigits: 1,
              maximumFractionDigits: 1,
            }).format(value / 100)} {/* Divide by 100 because 'percent' style expects 0.75 for 75% */}
          </div>
        );
      },
      size: 180,
      // ... other settings ...
      filterFn: (row, columnId, filterValue) => {
        if (!filterValue) return true;
        const [min, max] = filterValue;
        const value = parseFloat(String(row.getValue(columnId) || 0));
        return value >= min && value <= max;
      },
    }),
    columnHelper.accessor('rooms', {
      header: ({
        column
      }) => <DataGridColumnHeader title="Rooms" column={column} />,
      cell: ({
        getValue
      }) => <div>{getValue().toLocaleString()}</div>,
      size: 180,
      enableSorting: true,
      enableHiding: true,
      enableResizing: false,
      enablePinning: true,
      filterFn: (row, columnId, filterValue) => {
        if (!filterValue) return true;
        const [min, max] = filterValue;
        const value = Number(row.getValue(columnId));
        return value >= min && value <= max;
      },
    }),
    columnHelper.accessor('varSTLY', {
      header: ({
        column
      }) => <DataGridColumnHeader title="Var STLY" column={column} />,
      cell: ({
        getValue
      }) => <div>{getValue().toLocaleString()}</div>,
      size: 180,
      enableSorting: true,
      enableHiding: true,
      enableResizing: false,
      enablePinning: true,
      filterFn: (row, columnId, filterValue) => {
        if (!filterValue) return true;
        const [min, max] = filterValue;
        const value = Number(row.getValue(columnId));
        return value >= min && value <= max;
      },
    }),
    columnHelper.accessor('varPriorYear', {
      header: ({
        column
      }) => <DataGridColumnHeader title="Var  Prior Year" column={column} />,
      cell: ({
        getValue
      }) => <div>{getValue().toLocaleString()}</div>,
      size: 180,
      enableSorting: true,
      enableHiding: true,
      enableResizing: false,
      enablePinning: true,
      filterFn: (row, columnId, filterValue) => {
        if (!filterValue) return true;
        const [min, max] = filterValue;
        const value = Number(row.getValue(columnId));
        return value >= min && value <= max;
      },
    }),
    columnHelper.accessor('varBudget', {
      header: ({
        column
      }) => <DataGridColumnHeader title="Var  Budget" column={column} />,
      cell: ({
        getValue
      }) => <div>{getValue().toLocaleString()}</div>,
      size: 180,
      enableSorting: true,
      enableHiding: true,
      enableResizing: false,
      enablePinning: true,
      filterFn: (row, columnId, filterValue) => {
        if (!filterValue) return true;
        const [min, max] = filterValue;
        const value = Number(row.getValue(columnId));
        return value >= min && value <= max;
      },
    }),
    columnHelper.accessor('varForecast', {
      header: ({
        column
      }) => <DataGridColumnHeader title="Var  Forecast" column={column} />,
      cell: ({
        getValue
      }) => <div>{getValue().toLocaleString()}</div>,
      size: 180,
      enableSorting: true,
      enableHiding: true,
      enableResizing: false,
      enablePinning: true,
      filterFn: (row, columnId, filterValue) => {
        if (!filterValue) return true;
        const [min, max] = filterValue;
        const value = Number(row.getValue(columnId));
        return value >= min && value <= max;
      },
    }),
    columnHelper.accessor('aDR', {
      header: ({ column }) => <DataGridColumnHeader title="ADR" column={column} />,
      cell: ({ getValue }) => {
        const value = parseFloat(String(getValue() || 0));
        return (
          <div>
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
            }).format(value)}
          </div>
        );
      },
      size: 180,
      // ... other settings ...
      filterFn: (row, columnId, filterValue) => {
        if (!filterValue) return true;
        const [min, max] = filterValue;
        const value = parseFloat(String(row.getValue(columnId) || 0)); // Fixed syntax here
        return value >= min && value <= max;
      },
    }),
    columnHelper.accessor('revenue', {
      header: ({ column }) => <DataGridColumnHeader title="Revenue" column={column} />,
      cell: ({ getValue }) => {
        const value = parseFloat(String(getValue() || 0));
        return (
          <div className="font-medium">
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
              // Use maximumFractionDigits: 0 if you don't want to show cents for large revenue numbers
              minimumFractionDigits: 2, 
            }).format(value)}
          </div>
        );
      },
      size: 180,
      enableSorting: true,
      enableHiding: true,
      enableResizing: false,
      enablePinning: true,
      filterFn: (row, columnId, filterValue) => {
        if (!filterValue) return true;
        const [min, max] = filterValue;
        const value = parseFloat(String(row.getValue(columnId) || 0));
        return value >= min && value <= max;
      },
    }),
    columnHelper.display({
      id: 'actions',
      header: () => <span className="sr-only">Actions</span>,
      cell: ({
        row
      }) => <RowActions row={row} />,
      size: 60,
      enableHiding: false,
      enableSorting: false,
      enableResizing: false,
      enablePinning: false,
    })
  ]
  const filterFields = useMemo < FilterFieldConfig[] > (() => [{
    key: "segmentView",
    label: "segmentView",
    type: "text",
    placeholder: "Filter by segmentview..."
  }, {
    key: "occupancy",
    label: "occupancy",
    type: "number",
    placeholder: "Filter by occupancy..."
  }, {
    key: "rooms",
    label: "rooms",
    type: "number",
    placeholder: "Filter by rooms..."
  }, {
    key: "varSTLY",
    label: "varSTLY",
    type: "number",
    placeholder: "Filter by varstly..."
  }, {
    key: "varPriorYear",
    label: "varPriorYear",
    type: "number",
    placeholder: "Filter by varprioryear..."
  }, {
    key: "varBudget",
    label: "varBudget",
    type: "number",
    placeholder: "Filter by varbudget..."
  }, {
    key: "varForecast",
    label: "varForecast",
    type: "number",
    placeholder: "Filter by varforecast..."
  }, {
    key: "aDR",
    label: "aDR",
    type: "number",
    placeholder: "Filter by adr..."
  }, {
    key: "revenue",
    label: "revenue",
    type: "number",
    placeholder: "Filter by revenue..."
  }], []);
  // Apply filters to data
  const filteredData = useMemo(() => {
    const data = roomstransientData;
    let filtered = [...data];
    // Filter out empty filters before applying
    const activeFilters = filters.filter((filter) => {
      const {
        operator,
        values
      } = filter;
      // Empty and not_empty operators don't require values
      if (operator === "empty" || operator === "not_empty") return true;
      // Check if filter has meaningful values
      if (!values || values.length === 0) return false;
      // For text/string values, check if they're not empty strings
      if (values.every((value) => typeof value === "string" && value.trim() === "")) return false;
      // For number values, check if they're not null/undefined
      if (values.every((value) => value === null || value === undefined)) return false;
      // For arrays, check if they're not empty
      if (values.every((value) => Array.isArray(value) && value.length === 0)) return false;
      return true;
    });
    activeFilters.forEach((filter) => {
      const {
        field,
        operator,
        values
      } = filter;
      filtered = filtered.filter((item) => {
        const fieldValue = item[field as keyof RoomstransientData];
        switch (operator) {
          case "is":
            return values.some((value) => String(value) === String(fieldValue));
          case "is_not":
            return !values.some((value) => String(value) === String(fieldValue));
          case "contains":
            return values.some((value) => String(fieldValue).toLowerCase().includes(String(value).toLowerCase()));
          case "not_contains":
            return !values.some((value) => String(fieldValue).toLowerCase().includes(String(value).toLowerCase()));
          case "starts_with":
            return values.some((value) => String(fieldValue).toLowerCase().startsWith(String(value).toLowerCase()));
          case "ends_with":
            return values.some((value) => String(fieldValue).toLowerCase().endsWith(String(value).toLowerCase()));
          case "equals":
            return String(fieldValue) === String(values[0]);
          case "not_equals":
            return String(fieldValue) !== String(values[0]);
          case "greater_than":
            return Number(fieldValue) > Number(values[0]);
          case "less_than":
            return Number(fieldValue) < Number(values[0]);
          case "greater_than_or_equal":
            return Number(fieldValue) >= Number(values[0]);
          case "less_than_or_equal":
            return Number(fieldValue) <= Number(values[0]);
          case "between":
            if (values.length >= 2) {
              const min = Number(values[0]);
              const max = Number(values[1]);
              return Number(fieldValue) >= min && Number(fieldValue) <= max;
            }
            return true;
          case "not_between":
            if (values.length >= 2) {
              const min = Number(values[0]);
              const max = Number(values[1]);
              return Number(fieldValue) < min || Number(fieldValue) > max;
            }
            return true;
          case "empty":
            return fieldValue === null || fieldValue === undefined || String(fieldValue).trim() === "";
          case "not_empty":
            return fieldValue !== null && fieldValue !== undefined && String(fieldValue).trim() !== "";
          default:
            return true;
        }
      });
    });
    return filtered;
  }, [filters, roomstransientData]);
  const handleFiltersChange = useCallback((filters: Filter[]) => {
    setFilters(filters);
    setPagination((prev) => ({
      ...prev,
      pageIndex: 0
    }));
  }, []);
  const table = useReactTable({
    columns,
    data: filteredData,
    pageCount: Math.ceil((filteredData?.length || 0) / pagination.pageSize),
    state: {
      pagination,
      sorting,
    },
    enableSorting: true,
    enableSortingRemoval: false,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });
  return (<DataGrid table={table} recordCount={filteredData?.length || 0} tableLayout={{ dense: true, cellBorder: true, rowBorder: true, rowRounded: true, headerSticky: true, width: "fixed", columnsMovable: true, columnsPinnable: true, columnsVisibility: true }}>
			<div className="w-full space-y-2.5">

					<div>
						<Input
							className="peer min-w-60 h-8"
							value={(table.getState().globalFilter ?? "") as string}
							onChange={(e) => table.setGlobalFilter(e.target.value)}
							placeholder="Search all columns..."
							type="text"
							aria-label="Search all columns"
						/>
					</div>

					<div className="flex items-center gap-3">
						<DataGridColumnVisibility
							table={table}
							trigger={<Button variant="outline" size='sm'><Settings2 />View</Button>}
						/>
					</div>

			<div className="flex-1"><Filters
					filters={filters}
					fields={filterFields}
					variant="outline"
					onChange={handleFiltersChange}
				/></div>
				{filters.length > 0 && (
					<Button variant="outline" onClick={() => setFilters([])}>
						<FunnelX /> Clear
					</Button>
				)}
				<DataGridContainer>
					<ScrollArea>
						<DataGridTable />
						<ScrollBar orientation="horizontal" />
					</ScrollArea>
				</DataGridContainer>
				<DataGridPagination />
			</div>
		</DataGrid>);
};

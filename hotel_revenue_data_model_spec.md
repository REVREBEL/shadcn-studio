# Hotel Revenue Analytics Data Model Specification

## Overview

This document defines the core analytical data model used to power hotel revenue performance dashboards and reporting. The model is built on BigQuery views and supports calculations for key hospitality metrics such as Occupancy, ADR, RevPAR, Budget Variance, and Year‑over‑Year performance.

The design assumes downstream consumption by BI tools, data applications, and analytics interfaces.

Core objectives:

- Provide consistent definitions of revenue metrics
- Enable slicing by segment, room type, and property
- Support current pace, prior year comparison, and budget tracking
- Ensure predictable filtering behavior for dashboards and queries

---

# Core Data Sources

## Property Pace Tables

### vw_pace_property_current

These tables provide **property‑level capacity and demand context** for each stay date.

| Field | Type | Description |
|-----|-----|-----|
| property_code | STRING | Unique property identifier. Required filter for all queries |
| property_name | STRING | Property display name |
| stay_date | DATE | Stay date of inventory. Required filter |
| special_events | STRING | Event notes for the date |
| special_events_ly | STRING | Prior year event context |
| available_rooms | INTEGER | Total inventory available for the date |
| available_rooms_ly | INTEGER | Prior year available inventory |
| total_demand_total | INTEGER | Total demand across all segments |
| total_demand_total_ly_actual | INTEGER | Prior year total demand |
| total_demand_group | INTEGER | Group demand |
| total_demand_group_ly_actual | INTEGER | Prior year group demand |
| total_demand_transient | INTEGER | Transient demand |
| total_demand_transient_ly_actual | INTEGER | Prior year transient demand |
| lrv | FLOAT | Last room value |
| wash_pct | FLOAT | Expected cancellation rate |
| wash_pct_ly_actual | FLOAT | Prior year wash percentage |
| bar_price | FLOAT | Best available rate |
| snapshot_date | DATE | Date the snapshot was captured |

---

## Segment Pace Tables

### vw_pace_segment
### vw_pace_segment_current
### vw_pace_segment_monthly

These tables contain **segment‑level performance metrics** for rooms and revenue.

| Field | Type | Description |
|-----|-----|-----|
| property_code | STRING | Required filter |
| property_name | STRING | Property name |
| stay_date | DATE | Required filter |
| segment | STRING | Segment description |
| snapshot_date | DATE | Snapshot capture date |
| rooms_otb | INTEGER | Rooms currently on the books |
| rooms_stly | INTEGER | Same time last year rooms |
| rooms_st2y | INTEGER | Same time two years ago rooms |
| rooms_ly_actual | INTEGER | Final rooms sold last year |
| rev_otb | FLOAT | Revenue on the books |
| rev_stly | INTEGER | Revenue same time last year |
| rev_st2y | INTEGER | Revenue same time two years ago |
| rev_ly_actual | INTEGER | Final revenue last year |
| rooms_forecast | INTEGER | Forecasted rooms |
| rev_forecast | INTEGER | Forecasted revenue |
| rms_rooms_forecast | INTEGER | RMS generated rooms forecast |
| rms_rev_forecast | INTEGER | RMS generated revenue forecast |
| rooms_budget | INTEGER | Budgeted rooms |
| rev_budget | INTEGER | Budgeted revenue |
| cancelled_rooms | INTEGER | Cancelled rooms |
| cancelled_rooms_ly_actual | INTEGER | Prior year cancelled rooms |
| noshow_rooms | INTEGER | No‑show rooms |
| noshow_rooms_ly_actual | FLOAT | Prior year no‑show rooms |
| segment_code | STRING | Primary filter for segmentation |
| segment_group | STRING | Segment grouping label |
| segment_group_code | STRING | Filter for segment groups |
| finance_segment | STRING | Finance reporting segment |
| segment_sort | INTEGER | Sort order |

---

## Room Type Pace Tables

### vw_pace_roomtype
### vw_pace_roomtype_current

These tables provide **room‑type level inventory and revenue performance**.

| Field | Type | Description |
|-----|-----|-----|
| property_code | STRING | Required filter |
| property_name | STRING | Property name |
| stay_date | DATE | Required filter |
| roomtype | STRING | Room type description |
| roomclass | STRING | Room class |
| snapshot_date | DATE | Snapshot date |
| available_rooms | INTEGER | Inventory available |
| rooms_otb | INTEGER | Rooms currently on books |
| rooms_stly | INTEGER | Same time last year |
| rooms_st2y | INTEGER | Same time two years ago |
| rooms_ly_actual | INTEGER | Actual rooms last year |
| rooms_forecast | INTEGER | Forecast rooms |
| rms_adr_forecast | INTEGER | RMS ADR forecast |
| rev_otb | FLOAT | Revenue on books |
| rev_stly | INTEGER | Revenue same time last year |
| rev_st2y | INTEGER | Revenue same time two years ago |
| rev_ly_actual | INTEGER | Prior year revenue |
| rms_rev_forecast | INTEGER | RMS revenue forecast |
| cancelled_rooms | INTEGER | Cancelled rooms |
| cancelled_rooms_ly_actual | INTEGER | Prior year cancellations |
| noshow_rooms | INTEGER | No shows |
| noshow_rooms_ly_actual | FLOAT | Prior year no shows |
| roomtype_code | STRING | Room type filter |
| roomtype_class | STRING | Room class grouping |
| roomtype_category_code | STRING | Room category filter |
| roomtype_category_base | STRING | Base category |
| roomtype_category | STRING | Room category |
| roomtype_available_rooms | INTEGER | Room inventory by type |
| roomtype_sort | INTEGER | Sort order |

---

# Required Query Filters

To maintain consistent performance and accurate aggregations, queries should always include:

Required filters:

- property_code or property_name
- stay_date range or month/year filters

Example pattern:

```sql
WHERE property_code = 'XYZ'
AND DATE_TRUNC(stay_date, MONTH) = DATE '2025-07-01'
```

---

# Example Query Pattern

## Monthly Date Filter

```sql
FROM vw_pace_segment_current
WHERE property_name = '${inputs.selected_hotel.value}'
AND DATE_PART('year', stay_date) = COALESCE(${inputs.selected_year}, ${current_period[0].current_year})
AND DATE_PART('month', stay_date) = COALESCE(${inputs.selected_month}, ${current_period[0].current_month})
```

---

# Core Metric Definitions

## Rooms Sold

```
rooms_otb
```

Rooms currently on the books for the stay date.

---

## Revenue

```
rev_otb
```

Total booked revenue for the stay date.

---

## Occupancy

```
Occupancy = Rooms Sold / Available Rooms
```

SQL

```sql
rooms_otb / NULLIF(available_rooms,0)
```

---

## Average Daily Rate (ADR)

```
ADR = Revenue / Rooms Sold
```

SQL

```sql
rev_otb / NULLIF(rooms_otb,0)
```

---

## Revenue Per Available Room (RevPAR)

```
RevPAR = Revenue / Available Rooms
```

SQL

```sql
rev_otb / NULLIF(available_rooms,0)
```

---

# Year‑Over‑Year Metrics

## Occupancy Variance

```sql
(rooms_otb / available_rooms) - (rooms_ly_actual / available_rooms)
```

---

## ADR Variance

```sql
(rev_otb / rooms_otb) - (rev_ly_actual / rooms_ly_actual)
```

---

## RevPAR Variance

```sql
(rev_otb / available_rooms) - (rev_ly_actual / available_rooms)
```

---

# Budget Metrics

## Budget Occupancy

```sql
rooms_budget / available_rooms
```

## Budget ADR

```sql
rev_budget / rooms_budget
```

## Budget RevPAR

```sql
rev_budget / available_rooms
```

---

# Budget Variances

## Occupancy vs Budget

```sql
(rooms_budget / available_rooms) - (rooms_otb / available_rooms)
```

## ADR vs Budget

```sql
(rev_budget / rooms_budget) - (rev_otb / rooms_otb)
```

## RevPAR vs Budget

```sql
(rev_budget / available_rooms) - (rev_otb / available_rooms)
```

---

# Absolute Variance Metrics

| Metric | Formula |
|------|------|
| Rooms Variance | rooms_otb - rooms_ly_actual |
| Revenue Variance | rev_otb - rev_ly_actual |
| Rooms vs Budget | rooms_budget - rooms_otb |
| Revenue vs Budget | rev_budget - rev_otb |

---

# Budget Achievement

## Budget Reach Percentage

```sql
rev_otb / NULLIF(rev_budget,0)
```

Indicates percent of revenue budget achieved.

---

# Data Modeling Relationships

Primary join keys:

```
property_code
stay_date
snapshot_date
```

Typical join structure:

```
segment table
JOIN property capacity table
ON property_code
AND stay_date
```

Example

```sql
seg_totals
JOIN cap_totals
ON seg_totals.property_code = cap_totals.property_code
AND seg_totals.stay_date = cap_totals.stay_date
```

---

# Recommended Partitioning Strategy

For warehouse performance:

Partition tables by

```
stay_date
```

Cluster by

```
property_code
segment_code
roomtype_code
```

---

# Recommended Dashboard Queries

Typical dashboards should support:

- Monthly performance summary
- Pace vs prior year
- Pace vs budget
- Segment mix
- Room type mix
- Forecast vs OTB

---

# Example KPI Dataset

Typical dashboard output fields

| Field | Description |
|-----|-----|
| rooms_cy | Rooms sold current year |
| revenue_cy | Revenue current year |
| rooms_py | Prior year rooms |
| revenue_py | Prior year revenue |
| occ_cy | Occupancy current year |
| occ_py | Occupancy prior year |
| adr_cy | ADR current year |
| adr_py | ADR prior year |
| revpar_cy | RevPAR current year |
| revpar_py | RevPAR prior year |
| occ_var | Occupancy variance |
| adr_var | ADR variance |
| revpar_var | RevPAR variance |

---

# Analytical Use Cases

This model supports:

- Revenue management pacing analysis
- Segment performance tracking
- Budget variance reporting
- Forecast validation
- Room type yield analysis

---

# Future Enhancements

Potential extensions of the model:

- Channel attribution tables
- Booking window metrics
- Lead time analytics
- Market segment normalization
- Competitive set benchmarking

---

End of Specification


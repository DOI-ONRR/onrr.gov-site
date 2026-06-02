-- Composite index on revenue for GROUP BY + joins
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_revenue_period_commodity_location_fund
  ON revenue (period, commodity, location, fund);

-- Filter indexes on lookup tables
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_period_type
  ON period (type);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_location_land_type
  ON location (land_type);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_fund_revenue_type
  ON fund (revenue_type);

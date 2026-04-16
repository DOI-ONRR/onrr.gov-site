/**
 * Builds a Fiscal Year period record from a production record.
 *
 * Based on: insert_period_production_fy.sql
 *
 * @param {Object} record - The production record with fiscal_year
 * @returns {Object|null} - A period record ready for insertion, or null if invalid
 */
export function buildPeriodRecord(record) {
  const fiscalYearStr = record.fiscal_year;

  if (!fiscalYearStr) {
    return null;
  }

  const fiscalYear = parseInt(fiscalYearStr, 10);

  if (isNaN(fiscalYear)) {
    return null;
  }

  return {
    type: 'Fiscal Year',
    calendar_year: fiscalYear,
    fiscal_year: fiscalYear,
    calendar_month: 0,
    month_long: '',
    month_short: '',
    fiscal_month: 0,
    period_date: `${fiscalYear}-01-01`,
  };
}

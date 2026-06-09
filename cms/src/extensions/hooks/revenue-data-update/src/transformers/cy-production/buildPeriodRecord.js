/**
 * Builds a Calendar Year period record from a production record.
 *
 * Based on: insert_period_production_cy.sql
 *
 * @param {Object} record - The production record with calendar_year
 * @returns {Object|null} - A period record ready for insertion, or null if invalid
 */
export function buildPeriodRecord(record) {
  const calendarYearStr = record.calendar_year;

  if (!calendarYearStr) {
    return null;
  }

  const calendarYear = parseInt(calendarYearStr, 10);

  if (isNaN(calendarYear)) {
    return null;
  }

  return {
    type: 'Calendar Year',
    calendar_year: calendarYear,
    fiscal_year: calendarYear,
    calendar_month: 0,
    month_long: '',
    month_short: '',
    fiscal_month: 0,
    period_date: `${calendarYear}-01-01`,
  };
}

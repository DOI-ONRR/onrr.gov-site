/**
 * Builds a period record from a production record for insertion into the period table.
 * Calculates fiscal year and fiscal month (federal fiscal year starts October 1).
 *
 * Based on: insert_period_production.sql
 *
 * @param {Object} record - The production record with production_date (e.g., "1/1/2013")
 * @returns {Object|null} - A period record ready for insertion, or null if invalid
 */
export function buildPeriodRecord(record) {
  const periodDateStr = record.production_date;

  if (!periodDateStr) {
    return null;
  }

  // Parse the production_date string
  const periodDate = parseDate(periodDateStr);

  console.log('[buildPeriodRecord]', { periodDate })

  if (!periodDate) {
    return null;
  }

  const calendarYear = periodDate.getFullYear();
  const calendarMonth = periodDate.getMonth() + 1; // JavaScript months are 0-indexed

  // Calculate fiscal year and month (fiscal year starts October 1)
  // October = fiscal month 1, November = 2, ..., September = 12
  // Fiscal year is calendar year + 1 for Oct-Dec
  const fiscalMonth = ((calendarMonth + 2) % 12) + 1;
  const fiscalYear = calendarMonth >= 10 ? calendarYear + 1 : calendarYear;

  // Format month names
  const monthLong = periodDate.toLocaleDateString('en-US', { month: 'long' });
  const monthShort = periodDate.toLocaleDateString('en-US', { month: 'short' });

  console.log('[buildPeriodRecord]', {
    type: 'Monthly',
    calendar_year: calendarYear,
    fiscal_year: fiscalYear,
    calendar_month: calendarMonth,
    month_long: monthLong,
    month_short: monthShort,
    fiscal_month: fiscalMonth,
    period_date: formatDate(periodDate),
  });

  return {
    type: 'Monthly',
    calendar_year: calendarYear,
    fiscal_year: fiscalYear,
    calendar_month: calendarMonth,
    month_long: monthLong,
    month_short: monthShort,
    fiscal_month: fiscalMonth,
    period_date: formatDate(periodDate),
  };
}

/**
 * Parses a date string into a Date object.
 * Supports m/d/yyyy format (e.g., "1/1/2013") and YYYY-MM-DD format.
 *
 * @param {string} dateStr - Date string in m/d/yyyy or YYYY-MM-DD format
 * @returns {Date|null} - Date object or null if invalid
 */
function parseDate(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') {
    return null;
  }

  console.log('parseDate', { dateStr })

  // Handle m/d/yyyy format (e.g., "1/1/2013")
  if (dateStr.includes('/')) {
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      const month = parseInt(parts[0], 10) - 1; // JavaScript months are 0-indexed
      const day = parseInt(parts[1], 10);
      const year = parseInt(parts[2], 10);

      if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
        return new Date(year, month, day);
      }
    }
  }

  // Handle YYYY-MM-DD format
  if (dateStr.includes('-')) {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // JavaScript months are 0-indexed
      const day = parseInt(parts[2], 10);

      if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
        return new Date(year, month, day);
      }
    }
  }

  return null;
}

/**
 * Formats a Date object as YYYY-MM-DD.
 *
 * @param {Date} date - Date object
 * @returns {string} - Formatted date string
 */
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

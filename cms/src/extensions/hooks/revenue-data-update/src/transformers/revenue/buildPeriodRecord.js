/**
 * Builds period records from a revenue record for insertion into the period table.
 * Creates Monthly period, and optionally Fiscal Year (month 9) or Calendar Year (month 12) periods.
 *
 * Based on: insert_period_revenue.sql
 *
 * @param {Object} record - The revenue record with accept_date (e.g., "1/1/2026")
 * @returns {Object[]} - Array of period records ready for insertion
 */
export function buildPeriodRecords(record) {
  const acceptDateStr = record.accept_date;

  if (!acceptDateStr) {
    return [];
  }

  // Parse the accept_date string
  const acceptDate = parseDate(acceptDateStr);

  if (!acceptDate) {
    return [];
  }

  const calendarYear = acceptDate.getFullYear();
  const calendarMonth = acceptDate.getMonth() + 1; // JavaScript months are 0-indexed

  // Calculate fiscal year and month (fiscal year starts October 1)
  // Federal fiscal year: adding 3 months to get the fiscal year
  // October (10) + 3 = 13 -> next year, January
  const fiscalMonth = ((calendarMonth + 2) % 12) + 1;
  const fiscalYear = calendarMonth >= 10 ? calendarYear + 1 : calendarYear;

  // Format month names
  const monthLong = acceptDate.toLocaleDateString('en-US', { month: 'long' });
  const monthShort = acceptDate.toLocaleDateString('en-US', { month: 'short' });

  const periods = [];

  // Always create Monthly period
  periods.push({
    type: 'Monthly',
    calendar_year: calendarYear,
    fiscal_year: fiscalYear,
    calendar_month: calendarMonth,
    month_long: monthLong,
    month_short: monthShort,
    fiscal_month: fiscalMonth,
    period_date: formatDate(acceptDate),
  });

  // Create Fiscal Year period if month is September (month 9)
  if (calendarMonth === 9) {
    periods.push({
      type: 'Fiscal Year',
      calendar_year: fiscalYear,
      fiscal_year: fiscalYear,
      calendar_month: 0,
      month_long: '',
      month_short: '',
      fiscal_month: 0,
      period_date: `${fiscalYear}-01-01`,
    });
  }

  // Create Calendar Year period if month is December (month 12)
  if (calendarMonth === 12) {
    periods.push({
      type: 'Calendar Year',
      calendar_year: calendarYear,
      fiscal_year: calendarYear,
      calendar_month: 0,
      month_long: '',
      month_short: '',
      fiscal_month: 0,
      period_date: `${calendarYear}-01-01`,
    });
  }

  return periods;
}

/**
 * Parses a date string into a Date object.
 * Supports m/d/yyyy format (e.g., "1/1/2026") and YYYY-MM-DD format.
 *
 * @param {string} dateStr - Date string in m/d/yyyy or YYYY-MM-DD format
 * @returns {Date|null} - Date object or null if invalid
 */
function parseDate(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') {
    return null;
  }

  // Handle m/d/yyyy format (e.g., "1/1/2026")
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

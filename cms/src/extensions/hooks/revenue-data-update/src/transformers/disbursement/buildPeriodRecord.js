/**
 * Builds a period record from a disbursement record for insertion into the period table.
 * Calculates fiscal year and fiscal month (federal fiscal year starts October 1).
 *
 * @param {Object} record - The disbursement record with month (e.g., "January") and calendar_year
 * @returns {Object} - A period record ready for insertion
 */
export function buildPeriodRecord(record) {
  const monthName = record.month || '';
  const calendarYear = parseInt(record.calendar_year, 10);

  // Parse the date from month name and year
  const periodDate = parseMonthYear(monthName, calendarYear);

  if (!periodDate) {
    return null;
  }

  const calendarMonth = periodDate.getMonth() + 1; // JavaScript months are 0-indexed

  // Calculate fiscal year and month (fiscal year starts October 1)
  // October = fiscal month 1, November = 2, ..., September = 12
  // Fiscal year is calendar year + 1 for Oct-Dec
  const fiscalMonth = ((calendarMonth + 2) % 12) + 1;
  const fiscalYear = calendarMonth >= 10 ? calendarYear + 1 : calendarYear;

  // Format month abbreviation
  const monthShort = periodDate.toLocaleDateString('en-US', { month: 'short' });

  // Format period_date as YYYY-MM-DD
  const periodDateStr = formatDate(periodDate);

  return {
    type: 'Monthly',
    calendar_year: calendarYear,
    fiscal_year: fiscalYear,
    calendar_month: calendarMonth,
    month_long: monthName,
    month_short: monthShort,
    fiscal_month: fiscalMonth,
    period_date: periodDateStr,
  };
}

/**
 * Parses a month name and year into a Date object (first of that month).
 *
 * @param {string} monthName - Full month name (e.g., "January")
 * @param {number} year - Calendar year
 * @returns {Date|null} - Date object or null if invalid
 */
function parseMonthYear(monthName, year) {
  if (!monthName || isNaN(year)) {
    return null;
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const monthIndex = monthNames.findIndex(
    m => m.toLowerCase() === monthName.toLowerCase()
  );

  if (monthIndex === -1) {
    return null;
  }

  return new Date(year, monthIndex, 1);
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

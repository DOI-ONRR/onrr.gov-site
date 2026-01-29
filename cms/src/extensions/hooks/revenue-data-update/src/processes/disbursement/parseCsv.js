/**
 * CSV parser for disbursement data files.
 */

/**
 * Parses a CSV string into an array of objects.
 * Uses the first row as headers for object keys.
 *
 * @param {string} csvString - The CSV content as a string
 * @returns {Array<Object>} - Array of records with header keys
 */
export function parseCsv(csvString) {
  const lines = parseLines(csvString);

  if (lines.length === 0) {
    return [];
  }

  // First line is headers
  const headers = parseLine(lines[0]);

  // Parse remaining lines as data rows
  const records = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseLine(lines[i]);

    // Skip empty lines
    if (values.length === 0 || (values.length === 1 && values[0] === '')) {
      continue;
    }

    // Create object from headers and values
    const record = {};
    for (let j = 0; j < headers.length; j++) {
      record[headers[j]] = values[j] !== undefined ? values[j] : '';
    }
    records.push(record);
  }

  return records;
}

/**
 * Splits CSV content into lines, handling CRLF and LF line endings.
 * Preserves lines that contain newlines within quoted fields.
 *
 * @param {string} csvString - The CSV content
 * @returns {Array<string>} - Array of lines
 */
function parseLines(csvString) {
  const lines = [];
  let currentLine = '';
  let inQuotes = false;

  for (let i = 0; i < csvString.length; i++) {
    const char = csvString[i];
    const nextChar = csvString[i + 1];

    if (char === '"') {
      inQuotes = !inQuotes;
      currentLine += char;
    } else if ((char === '\r' && nextChar === '\n') && !inQuotes) {
      lines.push(currentLine);
      currentLine = '';
      i++; // Skip the \n
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      lines.push(currentLine);
      currentLine = '';
    } else {
      currentLine += char;
    }
  }

  // Don't forget the last line if it doesn't end with a newline
  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

/**
 * Parses a single CSV line into an array of values.
 * Handles quoted fields containing commas and escaped quotes.
 *
 * @param {string} line - A single CSV line
 * @returns {Array<string>} - Array of field values
 */
function parseLine(line) {
  const values = [];
  let currentValue = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"' && !inQuotes) {
      // Start of quoted field
      inQuotes = true;
    } else if (char === '"' && inQuotes) {
      if (nextChar === '"') {
        // Escaped quote inside quoted field
        currentValue += '"';
        i++; // Skip the next quote
      } else {
        // End of quoted field
        inQuotes = false;
      }
    } else if (char === ',' && !inQuotes) {
      // Field separator
      values.push(currentValue.trim());
      currentValue = '';
    } else {
      currentValue += char;
    }
  }

  // Don't forget the last value
  values.push(currentValue.trim());

  return values;
}

/**
 * Shared utility functions for data processing.
 */

/**
 * Converts a CSV header to its snake_case property name.
 * Returns the mapped value if it exists in fieldMap, otherwise
 * converts to lowercase and replaces spaces with underscores.
 *
 * @param {string} header - The CSV header name
 * @param {Object} fieldMap - The field mapping object
 * @returns {string} - The snake_case property name
 */
export function mapHeader(header, fieldMap) {
  if (fieldMap[header]) {
    return fieldMap[header];
  }
  // Fallback: convert to lowercase and replace spaces with underscores
  return header.toLowerCase().replace(/\s+/g, '_');
}

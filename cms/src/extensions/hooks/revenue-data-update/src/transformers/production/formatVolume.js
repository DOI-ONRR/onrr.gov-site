/**
 * Converts accounting notation for volume values.
 * Transforms parentheses notation (123) to negative numbers -123.
 *
 * Based on: format_volume.sql
 *
 * @param {Object} record - The production record
 * @returns {Object} - The record with formatted volume
 */
export function formatVolume(record) {
  if (!record.volume) {
    return record;
  }

  let volume = record.volume;

  // Convert accounting notation: (123) -> -123
  volume = volume.replace('(', '-');
  volume = volume.replace(')', '');

  return {
    ...record,
    volume,
  };
}

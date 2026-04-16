/**
 * Transforms revenue type to standardized format.
 * - Empty -> Other revenues
 * - Civil Penalty -> Civil penalties
 * - Capitalizes first letter, lowercases rest
 *
 * Based on: transform_revenue_type.sql
 *
 * @param {Object} record - The revenue record
 * @returns {Object} - The record with transformed revenue type
 */
export function transformRevenueType(record) {
  let revenueType = record.revenue_type;

  if (revenueType === '' || revenueType == null) {
    return {
      ...record,
      revenue_type: 'Other revenues',
    };
  }

  switch (revenueType) {
    case 'Civil Penalty':
      revenueType = 'Civil penalties';
      break;
    default:
      // Capitalize first letter, lowercase the rest
      revenueType = revenueType.charAt(0).toUpperCase() + revenueType.slice(1).toLowerCase();
      break;
  }

  return {
    ...record,
    revenue_type: revenueType,
  };
}

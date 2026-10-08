/**
 * Derive location.land_type from land_class + land_category, mirroring nrrd's
 * location_bri() BEFORE-INSERT trigger (database/changelog/src/functions/location_bri.sql).
 *
 * The loaders must set land_type explicitly: the Directus location table has no equivalent
 * trigger, so without it a loader-created location row has a NULL land_type and the combined
 * "Land type" filter on the dataset pages (WHERE l.land_type IN (...)) returns no rows.
 *
 * @param {string} landClass - e.g. 'Federal', 'Native American', 'Mixed Exploratory'
 * @param {string} landCategory - e.g. 'Onshore', 'Offshore', 'Not Tied to a Lease'
 * @returns {string} - The land_type label, or '' when no rule matches.
 */
export function deriveLandType(landClass, landCategory) {
  if (landClass === 'Federal' && landCategory === 'Not Tied to a Lease') {
    return 'Federal - not tied to a lease';
  }
  if (landClass === 'Native American') {
    return 'Native American';
  }
  if ((landClass === 'Federal' || landClass === 'Mixed Exploratory') && landCategory === 'Onshore') {
    return 'Federal onshore';
  }
  if ((landClass === 'Federal' || landClass === 'Mixed Exploratory') && landCategory === 'Offshore') {
    return 'Federal offshore';
  }
  return '';
}

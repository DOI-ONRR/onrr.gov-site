/**
 * Checks if an error is a unique constraint violation.
 *
 * Directus wraps database errors, so we check for common patterns
 * across different database drivers (PostgreSQL, MySQL, SQLite).
 *
 * @param {Error} error - The error to check
 * @returns {boolean} - True if this is a unique constraint violation
 */
export function isUniqueConstraintError(error) {
  const message = error?.message?.toLowerCase() || '';
  const code = error?.code || error?.extensions?.code || '';

  // PostgreSQL: unique_violation (23505)
  if (code === '23505' || message.includes('unique constraint') || message.includes('duplicate key')) {
    return true;
  }

  // MySQL: ER_DUP_ENTRY (1062)
  if (code === 'ER_DUP_ENTRY' || code === '1062' || message.includes('duplicate entry')) {
    return true;
  }

  // SQLite: SQLITE_CONSTRAINT_UNIQUE (2067)
  if (code === 'SQLITE_CONSTRAINT_UNIQUE' || message.includes('unique constraint failed')) {
    return true;
  }

  // Directus may wrap errors with RECORD_NOT_UNIQUE
  if (code === 'RECORD_NOT_UNIQUE' || message.includes('record not unique')) {
    return true;
  }

  return false;
}

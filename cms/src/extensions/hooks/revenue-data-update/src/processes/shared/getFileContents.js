/**
 * Retrieves file contents from Directus storage.
 */

/**
 * Gets the contents of a file from Directus by its ID.
 *
 * @param {string} fileId - The UUID of the file in Directus
 * @param {Object} context - Directus context
 * @param {Object} context.services - Directus services
 * @param {Object} context.schema - Database schema
 * @param {Object} context.accountability - User accountability
 * @returns {Promise<string>} - The file contents as a string
 * @throws {Error} - If file not found or cannot be read
 */
export async function getFileContents(fileId, context) {
  console.log('[Get File Contents] Process started:', { fileId });
  const { services, schema, accountability } = context;
  const { AssetsService, FilesService } = services;

  // Get file metadata first to verify it exists
  const filesService = new FilesService({
    schema,
    accountability,
  });

  console.log('[Get File Contents] Read file');
  const file = await filesService.readOne(fileId);

  if (!file) {
    throw new Error(`File not found: ${fileId}`);
  }

  // Use AssetsService to get the actual file content
  const assetsService = new AssetsService({
    schema,
    accountability,
  });

  console.log('[Get File Contents] get stream');
  const { stream } = await assetsService.getAsset(fileId);

  console.log('[Get File Contents] convert stream to chunks');
  // Convert stream to string
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }

  console.log('[Get File Contents] create buffer');
  const buffer = Buffer.concat(chunks);
  return buffer.toString('utf-8');
}

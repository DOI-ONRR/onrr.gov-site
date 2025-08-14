import path from 'node:path';
import serveStatic from 'serve-static';

/**
 * Exposes files under:
 *   /tinymce-static/tinymce
 */
export default {
  id: 'tinymce-static',
  handler: (router) => {
    // Absolute path to public assets
    const rootDir = path.join(
      process.cwd(),
			'extensions',
      'directus-extension-onrr-editor-tiny',
      'public'
    );

    const staticMiddleware = serveStatic(rootDir, {
      fallthrough: true,
      setHeaders(res, filePath) {
        if (filePath.endsWith('.js')) {
          res.setHeader('Cache-Control', 'public, max-age=604800, immutable');
          res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
        }
      },
    });

    router.use('/tinymce-static', staticMiddleware);
  },
};
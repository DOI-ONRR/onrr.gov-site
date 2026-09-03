import path from 'node:path';
import fs from 'node:fs';
import express from 'express';

export default {
  id: 'wysiwyg-static', // Base URL => /wysiwyg-static
  // Example mappings:
  //  /wysiwyg-static/tinymce/tinymce.min.js  -> <rootDir>/tinymce/tinymce.min.js
  //  /wysiwyg-static/plugins/my-custom-link.js -> <rootDir>/plugins/my-custom-link.js
  handler: (router) => {
    const rootDir = path.join(
      process.cwd(),
      'extensions',
      'directus-extension-onrr-wysiwyg',
      'public'
    );

    // Plugin files (link.js, table.js, glossary.js, …) are served at stable URLs but their
    // contents change on every rebuild, so they must revalidate — otherwise the browser pins
    // a stale build. maxAge:0 keeps etag/last-modified, so unchanged files still 304.
    router.use('/plugins', express.static(path.join(rootDir, 'plugins'), { index: false, maxAge: 0 }));

    // TinyMCE core assets are version-stable — safe to cache long (no `immutable`, so they can
    // still revalidate after expiry).
    router.use('/', express.static(rootDir, { index: false, maxAge: '7d' }));

    // sanity checks
    router.get('/_ping', (_req, res) => res.send('ok'));
    router.get('/_check', (_req, res) => {
      const tinymcePath = path.join(rootDir, 'tinymce', 'tinymce.min.js');
      const pluginPath = path.join(rootDir, 'plugins', 'link.js');
      const tinymceExists = fs.existsSync(tinymcePath);
      const pluginExists = fs.existsSync(pluginPath);

      res.json({
        id: 'wysiwyg-static',
        rootDir,
        tinymcePath,
        tinymceExists,
        pluginPath,
        pluginExists
      });
    });
  },
};
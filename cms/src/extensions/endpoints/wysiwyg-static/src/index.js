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

    router.use('/', express.static(rootDir, { index: false, maxAge: '7d', immutable: true }));

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
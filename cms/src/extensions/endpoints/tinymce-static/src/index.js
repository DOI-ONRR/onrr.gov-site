import path from 'node:path';
import fs from 'node:fs';
import express from 'express';

export default {
  id: 'tinymce-static', // base URL => /tinymce-static
  handler: (router) => {
    const rootDir = path.join(
      process.cwd(),
      'extensions',
      'directus-extension-onrr-editor-tiny',
      'public'
    );

    router.use('/', express.static(rootDir, { index: false, maxAge: '7d', immutable: true }));

    // sanity checks
    router.get('/_ping', (_req, res) => res.send('ok'));
    router.get('/_check', (_req, res) => {
      const filePath = path.join(rootDir, 'tinymce', 'tinymce.min.js');
      res.json({ id: 'tinymce-static', rootDir, filePath, exists: fs.existsSync(filePath) });
    });
  },
};
import * as fileUtils from '../../../../utils/file-utils';

export default (router, context) => {
  const { services, getSchema } = context;
  const { FilesService } = services;

  router.get('/:file', async (req, res, next) => {
    try {
      const filesService = new FilesService({
        schema: await getSchema(),
        accountability: req.accountability
      });

      const fileName = req.params.file;

      const files = await filesService.readByQuery({ fields: ['*'], filter: { filename_download: { '_eq': fileName } } });

      // No matching file — return 404 instead of dereferencing files[0] (which
      // would throw and, being unhandled, crash the process).
      if (!files || files.length === 0) {
        return res.status(404).json({ errors: [{ message: `File not found: ${fileName}`, extensions: { code: 'NOT_FOUND' } }] });
      }

      const filePath = `/tmp/${fileName}`;
      const hostname = (req.hostname === 'localhost') ? 'localhost:8055' : `${req.hostname}:61443`
      const url = `https://${hostname}/assets/${files[0].id}`;

      await fileUtils.getFile(filePath, url);

      return res.sendFile(filePath);
    } catch (error) {
      // Hand any failure to Directus's error handler rather than letting an
      // unhandled rejection take down the app.
      return next(error);
    }
  });
};
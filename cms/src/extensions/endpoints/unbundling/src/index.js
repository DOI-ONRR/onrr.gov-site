import * as fileUtils from '../../../../utils/file-utils';

export default (router, context) => {
  const { services, getSchema } = context;
  const { FilesService } = services;

  router.get('/:file', async (req, res, next) => {

    const filesService = new FilesService({ 
      schema: await getSchema(), 
      accountability: req.accountability 
    });
    
    const fileName = req.params.file;

    const files = await filesService.readByQuery({ fields: ['*'],  filter: {filename_download: {'_eq': fileName}}});

    const filePath = `/tmp/${fileName}`;
    const hostname = (req.hostname === 'localhost') ? 'localhost:8055' : `${req.hostname}:61443`
    const url = `${req.protocol}://${hostname}/assets/${files[0].id}`;
    
    await fileUtils.getFile(filePath, url);
    
    return res.sendFile(filePath);

  });
};
import { serveFileByName } from '../../../../utils/serve-file';

export default (router, context) => {
  router.get('/:file', serveFileByName(context));
};

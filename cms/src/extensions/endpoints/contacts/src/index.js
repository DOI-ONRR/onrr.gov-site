export default (router, context) => {
	const { services } = context;
	const { ItemsService } = services;

	router.get('/pages', async (req, res, next) => {
    try {
      const service = new ItemsService('contacts', {
        schema: req.schema,
        accountability: req.accountability,
      });

      const rows = await service.readByQuery({
        fields: ['page'],
        limit: -1,
        group: ['page'],
				filter: {
					page: {
						_nnull: true
					}
				}
      });

			res.json({
        pages: rows.map(r => r.page),
      });
    } catch (err) {
      next(err);
    }
  });

	router.get('/tabs', async (req, res, next) => {
    try {
      const service = new ItemsService('contacts', {
        schema: req.schema,
        accountability: req.accountability,
      });

      const rows = await service.readByQuery({
        fields: ['tab'],
        limit: -1,
        group: ['tab'],
				filter: {
					tab: {
						_nnull: true
					}
				}
      });

			res.json({
        tabs: rows.map(r => r.tab),
      });
    } catch (err) {
      next(err);
    }
  });

	router.get('/accordions', async (req, res, next) => {
    try {
      const service = new ItemsService('contacts', {
        schema: req.schema,
        accountability: req.accountability,
      });

      const rows = await service.readByQuery({
        fields: ['accordion'],
        limit: -1,
        group: ['accordion'],
				filter: {
					accordion: {
						_nnull: true
					}
				}
      });

			res.json({
        accordions: rows.map(r => r.accordion),
      });
    } catch (err) {
      next(err);
    }
  });
};

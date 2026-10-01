import { logger } from "./utils/logger";
import { createAuthorize, parseAllowedRoles, requireUuidParam } from "./utils/authorize";
import { runPages } from "./services/pagesFlow";
import { runFiles } from "./services/filesFlow";

export default (router, { env, database }) => {
	// Only callers in an allowed role may push content upstream; see
	// utils/authorize.js. Configured per environment with
	// ONRR_FLOWS_ALLOWED_ROLES (comma-separated role names).
	const allowedRoles = parseAllowedRoles(env.ONRR_FLOWS_ALLOWED_ROLES ?? process.env.ONRR_FLOWS_ALLOWED_ROLES);
	if (allowedRoles.length === 0) {
		logger.warn('onrr-flows: ONRR_FLOWS_ALLOWED_ROLES is not set; every request to /onrr-flows will be rejected.');
	}
	router.use(createAuthorize({ database, allowedRoles, logger }));

	router.post('/pages/:id', requireUuidParam('id'), async (req, res, next) => {
		try {
			const id = req.params.id;
			const response = await runPages(id);
			res.json(response);
		}
		catch (error) {
			logger.error('Error in /pages', { error: error.message });
			next(error);
		}
	});

	router.post('/files/:fileUuid', requireUuidParam('fileUuid'), async (req, res, next) => {
		try {
			const fileUuid = req.params.fileUuid;
			const response = await runFiles(fileUuid);
			res.json(response);
		} catch (error) {
			logger.error('Error in /files', { error: error.message });
			next(error);
		}
	});

	router.use((err, req, res, next) => {
		res.status(500).json({
		  status: 'error',
		  message: err.message
		});
	});

};

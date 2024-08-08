import { getTabBlocksTabBlocksData, getTopLevelTabBlocksData, localFetch } from "./utils/tabBlocksTabBlocks";
import { logger } from "./utils/logger";
import diff from 'deep-diff';

export default (router) => {
	router.post('/tab-blocks-tab-blocks/:tabBlocksId', async (req, res) => {
		const tabBlocksId = req.params.tabBlocksId
		const originData = req.body
		const comparandData = await getTabBlocksTabBlocksData(tabBlocksId);

		const differences = diff(originData, comparandData)

		res.json(differences)
	});

	router.post('/top-level-tab-blocks/:tabBlocksId', async (req, res) => {
		try {
			const tabBlocksId = req.params.tabBlocksId
			const originData = req.body
			const comparandData = await getTopLevelTabBlocksData(tabBlocksId);
			const differences = diff(comparandData, originData)

			await localFetch(tabBlocksId);

			res.json(differences ? differences : []);
		}
		catch(error) {
			logger.error('Error in /top-level-tab-blocks', { error: error.message });
			next(error);
		}
	});

	router.use((err, req, res, next) => {
		// Log the error
		logger.error('Unhandled error in /top-level-tab-blocks', { error: err.message });
	
		res.status(500).json({
		  status: 'error',
		  message: err.message,
		  ...({ stack: err.stack })
		});
	  });
};

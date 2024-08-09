import { getTabBlocksById, getTabBlocksByIdFull, createTabBlock } from "./utils/tabBlocks";
import { createContentBlock } from './utils/contentBlocks';
import { createTabBlockLabelItem } from './utils/tabBlockLabels';
import { createTabBlocksTabBlocks } from './utils/tabBlocksTabBlocks';
import { logger } from "./utils/logger";
import diff from 'deep-diff';


export default (router, { services, exceptions, database, env }) => {
	const localEndpoint = env.DIRECTUS_EXTENSION_FLOWS_LOCAL_ENDPOINT;
	const upstreamEndpoint = env.DIRECTUS_EXTENSION_FLOWS_UPSTREAM_ENDPOINT;
	const authToken = env.DIRECTUS_EXTENSION_FLOWS_AUTH_TOKEN;

	const { AccountabilityService } = services;

	router.post('/tab-blocks/:id', async (req, res, next) => {
		logger.info(JSON.stringify(services, null, 2))
		logger.info(JSON.stringify(exceptions, null, 2))
		try {
			const authHeader = req.headers.authorization;
			if (!authHeader || !authHeader.startsWith('Bearer ')) {
                throw new Error('Authentication token is required');
            }
			const token = authHeader.split(' ')[1];

			const accountabilityService = new AccountabilityService({ database });

            const user = await accountabilityService.verifyToken(token);

            if (!user) {
                throw new Error('Invalid or expired token');
            }

			const id = req.params.id;
			const lhs = await getTabBlocksById(id, localEndpoint)
			const rhs = await getTabBlocksById(id, upstreamEndpoint)
			const differences = diff(lhs, rhs);

			if (differences.length == 1 && differences[0].kind == 'E' && !differences[0].rhs) {
				// create tab block upstream using response from query
				const createdTabBlocks = [];
				const newTabBlock = await getTabBlocksByIdFull(id, localEndpoint);
				for (let tabBlock of newTabBlock.tab_blocks_by_id.tab_blocks) {
					// create item
					switch (tabBlock.item.collection) {
						case ('content_blocks'):
							const contentBlockData = {
								id: tabBlock.item.id,
								status: tabBlock.item.status,
								block_label: tabBlock.item.block_label,
								block_v_col: tabBlock.item.block_v_col,
								block_content: tabBlock.item.block_content,
								equal_col_height: tabBlock.item.equal_col_height
							}
							const contentBlockId = await createContentBlock(contentBlockData, upstreamEndpoint, authToken);
							createdTabBlocks.push({
								id: tabBlock.id,
								Sort: tabBlock.Sort,
								item: contentBlockId,
								collection: tabBlock.item.collection,
								tab_blocks_id: {
									id: newTabBlock.tab_blocks_by_id.id
								}
							});
							break;
						case ('tab_block_label'):
							const tabBlockLabelData = {
								id: tabBlock.item.id,
								tab_block_label: tabBlock.item.tab_block_label
							}
							const tabBlockLabelId = await createTabBlockLabelItem(tabBlockLabelData, upstreamEndpoint, authToken);
							// TODO: refactor to function/class that accepts item and collection as parameters
							createdTabBlocks.push({
								id: tabBlock.id,
								Sort: tabBlock.Sort,
								item: tabBlockLabelId,
								collection: tabBlock.item.collection,
								tab_blocks_id: {
									id: newTabBlock.tab_blocks_by_id.id
								}
							})
							break;
						default:
							break;
					}
				}
				const tabBlockData = {
					id: newTabBlock.tab_blocks_by_id.id,
					status: newTabBlock.tab_blocks_by_id.status,
					block_v_col: newTabBlock.tab_blocks_by_id.block_v_col,
					tab_block_label: newTabBlock.tab_blocks_by_id.tab_block_label
				}
				const tabBlockId = await createTabBlock(tabBlockData, upstreamEndpoint, authToken);
				logger.info(`tab_blocks item with id ${tabBlockId} successfully created.`);
				const tabBlocksTabBlocksResponse = await createTabBlocksTabBlocks(createdTabBlocks, upstreamEndpoint, authToken);
				res.json(tabBlocksTabBlocksResponse);
			} else {
				res.json(differences ? differences : []);
			}
		}
		catch(error) {
			logger.error('Error in /tab-blocks', { error: error.message });
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

import { tabBlocksTabBlocks } from "../../queries/tabBlocks";
import { GraphQLClient } from "graphql-request";
import { logger } from '../../utils/logger';

export async function getTabBlocksTabBlocks(tabBlocksId, endpoint, authToken) {
    try {
        const client = new GraphQLClient(endpoint, {
            headers: {
                authorization: `Bearer ${authToken}`
            }
        });
        const data = await client.request(tabBlocksTabBlocks, { tabBlocksId: tabBlocksId });
        return data.tab_blocks_tab_blocks;
    } catch (error) {
        if (error.response?.errors?.some(e => e.extensions?.code === 'FORBIDDEN')) {
            logger.warn(`getTabBlocksTabBlocks (${tabBlocksId}): Permission denied`);
            return [];
        }
        logger.error("Error in getTabBlocksTabBlocks:", error);
    }
}
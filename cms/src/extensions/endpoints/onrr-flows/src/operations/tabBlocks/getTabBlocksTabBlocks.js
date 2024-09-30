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
        logger.error("Error in getTabBlocksTabBlocks:", error);
    }
}
import { tabBlocksTabBlocksById } from "../../queries/tabBlocks";
import { GraphQLClient } from "graphql-request";
import { logger } from '../../utils/logger';

export async function getTabBlocksTabBlocksById(tabBlocksTabBlocksId, endpoint) {
    try {
        const client = new GraphQLClient(endpoint);
        const data = await client.request(tabBlocksTabBlocksById, { id: tabBlocksTabBlocksId });
        return data.tab_blocks_tab_blocks_by_id;
    } catch (error) {
        logger.error("Error in getTabBlocksTabBlocksById:", error);
    }
}
import { tabBlocksById } from "../../queries/tabBlocks";
import { GraphQLClient } from "graphql-request";
import { logger } from '../../utils/logger';

export async function getTabBlocksById(tabBlocksId, endpoint) {
    try {
        console.log('in getTabBlocksById');
        const variables = {
            id: tabBlocksId,
        };
        const client = new GraphQLClient(endpoint);
        const data = await client.request(tabBlocksById, variables);
        return data.tab_blocks_by_id;
    } catch (error) {
        logger.error("Error fetching data:", error);
    }
}
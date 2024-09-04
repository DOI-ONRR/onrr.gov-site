import { tabBlocksById } from "../../queries/tabBlocks";
import { GraphQLClient } from "graphql-request";
import { logger } from '../../utils';

export async function getTabBlocksById(tabBlocksId, endpoint) {
    try {
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
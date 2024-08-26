import { tabBlocksByIdWithTabBlocks } from "../../queries/tabBlocks";
import { GraphQLClient } from "graphql-request";
import { logger } from '../../utils/logger';

export async function getTabBlocksByIdWithTabBlocks(tabBlocksId, endpoint) {
    try {
        const client = new GraphQLClient(endpoint);
        const data = await client.request(tabBlocksByIdWithTabBlocks, { id: tabBlocksId });
        return data;
    } catch (error) {
        logger.error("Error in getTabBlocksByIdWithTabBlocks:", error);
        throw new Error('Error in getTabBlocksByIdWithTabBlocks');
    }
}
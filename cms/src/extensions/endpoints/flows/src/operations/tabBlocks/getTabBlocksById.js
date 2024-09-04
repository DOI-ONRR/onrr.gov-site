import { tabBlocksById } from "../../queries/tabBlocks";
import { GraphQLClient } from "graphql-request";
import { logger } from '../../utils';

export async function getTabBlocksById(tabBlocksId, endpoint, authToken) {
    try {
        const client = new GraphQLClient(endpoint);
        if (authToken) {
            client.setHeaders({
                authorization: `Bearer ${authToken}`
            });
        }
        const data = await client.request(tabBlocksById, { id: tabBlocksId });
        return data.tab_blocks_by_id;
    } catch (error) {
        logger.error("Error fetching data:", error);
    }
}
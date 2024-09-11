import { updateTabBlocksItemMution } from "../../queries/tabBlocks";
import { GraphQLClient } from "graphql-request";
import { logger } from '../../utils/logger';

export async function updateTabBlocksItem(id, item, endpoint, authToken) {
    try {
        const client = new GraphQLClient(endpoint, {
            headers: {
                authorization: `Bearer ${authToken}`
            }
        });
        const response = await client.request(updateTabBlocksItemMution, { id: id, item: item });
        return response.update_tab_blocks_item;
    } catch (error) {
        logger.error('Error in updateTabBlocksItem: ', error)
        throw new Error('Error in updateTabBlocksItem');
    }
}
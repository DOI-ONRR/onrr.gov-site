import { updateTabBlocksTabBlocksItemMutation } from "../../queries/tabBlocks";
import { GraphQLClient } from "graphql-request";
import { logger } from '../../utils/logger';

export async function updateTabBlocksTabBlocksItem(item, endpoint, authToken) {
    try {
        const client = new GraphQLClient(endpoint, {
            headers: {
                authorization: `Bearer ${authToken}`
            }
        });
        const response = await client.request(updateTabBlocksTabBlocksItemMutation, { id: item.id, item: item });
        return response.update_tab_blocks_tab_blocks_item.id;
    } catch (error) {
        logger.error('Error in updateTabBlocksTabBlocksItem: ', error)
        throw new Error('Error in updateTabBlocksTabBlocksItem');
    }
}
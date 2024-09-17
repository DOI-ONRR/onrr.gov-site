import { deleteTabBlocksTabBlocksItemMutation } from "../../queries/tabBlocks";
import { GraphQLClient } from "graphql-request";
import { logger } from '../../utils/logger';

export async function deleteTabBlocksTabBlocksItem(id, endpoint, authToken) {
    try {
        const client = new GraphQLClient(endpoint, {
            headers: {
                authorization: `Bearer ${authToken}`
            }
        });
        const response = await client.request(deleteTabBlocksTabBlocksItemMutation, { id: id });
        return response.delete_tab_blocks_tab_blocks_item.id;
    } catch (error) {
        logger.error('Error in deleteTabBlocksTabBlocksItem: ', error)
        throw new Error('Error in deleteTabBlocksTabBlocksItem');
    }
}
import { updateContentBlocksItemMutation } from '../../queries/contentBlocks';
import { GraphQLClient } from "graphql-request";
import { logger } from '../../utils/logger';

export async function updateContentBlocksItem(id, item, endpoint, authToken) {
    try {
        const client = new GraphQLClient(endpoint, {
            headers: {
                authorization: `Bearer ${authToken}`
            }
        });
        const response = await client.request(updateContentBlocksItemMutation, { id: id, item: item });
        return response.update_content_blocks_item;
    } catch (error) {
        logger.error(`Error in updateContentBlocksItem (${id}):`, error);
        throw new Error('Error in updateContentBlocksItem');
    }
}
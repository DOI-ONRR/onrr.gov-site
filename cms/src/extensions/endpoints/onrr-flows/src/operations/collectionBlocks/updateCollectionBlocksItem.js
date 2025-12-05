import { updateCollectionBlocksItemMutation } from '../../queries/collectionBlocks';
import { GraphQLClient } from "graphql-request";
import { logger } from '../../utils/logger';

export async function updateCollectionBlocksItem(id, item, endpoint, authToken) {
    try {
        const client = new GraphQLClient(endpoint, {
            headers: {
                authorization: `Bearer ${authToken}`
            }
        });
        const response = await client.request(updateCollectionBlocksItemMutation, { id: id, item: item });
        return response.update_collection_blocks_item;
    } catch (error) {
        logger.error(`Error in updateCollectionBlocksItem (${id}):`, error);
        throw new Error('Error in updateCollectionBlocksItem');
    }
}
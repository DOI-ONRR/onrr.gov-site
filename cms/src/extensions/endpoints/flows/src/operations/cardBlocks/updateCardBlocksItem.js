import { updateCardBlocksItemMutation } from "../../queries/cardBlocks";
import { GraphQLClient } from "graphql-request";
import { logger } from '../../utils/logger';

export async function updateCardBlocksItem(id, item, endpoint, authToken) {
    try {
        const client = new GraphQLClient(endpoint, {
            headers: {
                authorization: `Bearer ${authToken}`
            }
        });
        const response = await client.request(updateCardBlocksItemMutation, { id: id, item: item });
        return response.update_card_blocks_item;
    } catch (error) {
        logger.error("Error in updateCardBlocksItem:", error);
        throw new Error('Error in updateCardBlocksItem');
    }
}
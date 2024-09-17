import { updateCardBlocksCardContentBlocksItemMutation } from "../../queries/cardBlocks";
import { GraphQLClient } from "graphql-request";
import { logger } from "../../utils";

export async function updateCardBlocksCardContentBlocksItem(item, endpoint, authToken) {
    try {
        const client = new GraphQLClient(endpoint);
        client.setHeaders({
            authorization: `Bearer ${authToken}`
        });
        const data = await client.request(updateCardBlocksCardContentBlocksItemMutation, { id: item.id, item: item });
        return data.update_card_blocks_card_content_blocks_item.id;
    } catch(error) {
        logger.error('Error in updateCardBlocksCardContentBlocksItem: ', error);
        throw new Error('Error in updateCardBlocksCardContentBlocksItem');
    }
}
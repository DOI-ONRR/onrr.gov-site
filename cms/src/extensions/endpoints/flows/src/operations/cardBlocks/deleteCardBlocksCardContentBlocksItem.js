import { deleteCardBlocksCardContentBlocksItemMutation } from "../../queries/cardBlocks";
import { GraphQLClient } from "graphql-request";
import { logger } from "../../utils";

export async function deleteCardBlocksCardContentBlocksItem(id, endpoint, authToken) {
    try {
        const client = new GraphQLClient(endpoint);
        client.setHeaders({
            authorization: `Bearer ${authToken}`
        });
        const data = await client.request(deleteCardBlocksCardContentBlocksItemMutation, { id: id });
        return data.delete_card_blocks_card_content_blocks_item.id;
    } catch(error) {
        logger.error('Error in deleteCardBlocksCardContentBlocksItem: ', error);
        throw new Error('Error in deleteCardBlocksCardContentBlocksItem');
    }
}
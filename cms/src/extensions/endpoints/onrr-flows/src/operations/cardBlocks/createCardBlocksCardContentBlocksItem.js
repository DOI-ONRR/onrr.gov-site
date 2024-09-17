import { createCardBlocksCardContentBlocksItemMutation } from "../../queries/cardBlocks";
import { GraphQLClient } from "graphql-request";
import { logger } from "../../utils";

export async function createCardBlocksCardContentBlocksItem(item, endpoint, authToken) {
    try {
        const client = new GraphQLClient(endpoint);
        client.setHeaders({
            authorization: `Bearer ${authToken}`
        });
        const data = await client.request(createCardBlocksCardContentBlocksItemMutation, { item: item });
        return data.create_card_blocks_card_content_blocks_item.id;
    } catch(error) {
        logger.error('Error in createCardBlocksCardContentBlocksItem: ', error);
        throw new Error('Error in createCardBlocksCardContentBlocksItem');
    }
}
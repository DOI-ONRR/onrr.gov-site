import { cardBlocksCardContentBlocks } from "../../queries/cardBlocks";
import { GraphQLClient } from "graphql-request";
import { logger } from "../../utils";

export async function getCardBlocksCardContentBlocks(id, endpoint, authToken) {
    try {
        const client = new GraphQLClient(endpoint);
        if (authToken) {
            client.setHeaders({
                authorization: `Bearer ${authToken}`
            });
        }
        const data = await client.request(cardBlocksCardContentBlocks, { id: id });
        return data.card_blocks_card_content_blocks;
    } catch(error) {
        logger.error('Error in getCardBlocksCardContentBlocks: ', error);
        throw new Error('Error in getCardBlocksCardContentBlocks');
    }
}
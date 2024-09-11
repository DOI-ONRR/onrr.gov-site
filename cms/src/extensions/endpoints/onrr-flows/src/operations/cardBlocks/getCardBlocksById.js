import { cardBlocksById } from "../../queries/cardBlocks";
import { GraphQLClient } from "graphql-request";
import { logger } from '../../utils/logger';

export async function getCardBlocksById(id, endpoint, authToken) {
    try {
        const client = new GraphQLClient(endpoint);
        if (authToken) {
            client.setHeaders({
                authorization: `Bearer ${authToken}`
            });
        }
        const data = await client.request(cardBlocksById, { id: id });
        return data.card_blocks_by_id;
    }
    catch(error) {
        logger.error(`Error in getCardBlocksById (${id}):`, error);
        throw new Error('Error in getCardBlocksById');
    }
}
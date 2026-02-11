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

        // Handle null response (may occur when item does not exist)
        if (data.card_blocks_by_id === null) {
            logger.warn(`getCardBlocksById (${id}): No data returned (possibly due to not existing)`);
            return null;
        }

        return data.card_blocks_by_id;
    }
    catch(error) {
        // Handle GraphQL errors (including FORBIDDEN)
        if (error.response?.errors) {
            const forbiddenError = error.response.errors.find(e => e.extensions?.code === 'FORBIDDEN');
            if (forbiddenError) {
                logger.warn(`getCardBlocksById (${id}): Permission denied - ${forbiddenError.message}`);
                return null;
            }
        }

        logger.error(`Error in getCardBlocksById (${id}):`, error);
        throw new Error('Error in getCardBlocksById');
    }
}
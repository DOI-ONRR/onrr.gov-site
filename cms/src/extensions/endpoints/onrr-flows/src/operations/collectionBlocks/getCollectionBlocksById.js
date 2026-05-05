import { getCollectionBlocksByIdQuery } from '../../queries/collectionBlocks';
import { GraphQLClient } from "graphql-request";
import { logger } from '../../utils/logger';

export async function getCollectionBlocksById(id, endpoint, authToken) {
    try {
        const client = new GraphQLClient(endpoint);
        if (authToken) {
            client.setHeaders({
                authorization: `Bearer ${authToken}`
            });
        }
        const data = await client.request(getCollectionBlocksByIdQuery, { id: id })
        return data.collection_blocks_by_id;
    }
    catch(error) {
        if (error.response?.errors?.some(e => e.extensions?.code === 'FORBIDDEN')) {
            logger.warn(`getCollectionBlocksById (${id}): Permission denied`);
            return null;
        }
        logger.error(`Error in getCollectionBlocksById (${id}):`, error);
        throw new Error('Error in getCollectionBlocksById');
    }
}
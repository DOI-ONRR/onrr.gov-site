import { contentBlocksById } from '../../queries/contentBlocks';
import { GraphQLClient } from "graphql-request";
import { logger } from '../../utils/logger';

export async function getContentBlocksById(id, endpoint, authToken) {
    try {
        const client = new GraphQLClient(endpoint);
        if (authToken) {
            client.setHeaders({
                authorization: `Bearer ${authToken}`
            });
        }
        const data = await client.request(contentBlocksById, { id: id })
        return data.content_blocks_by_id;
    }
    catch(error) {
        if (error.response?.errors?.some(e => e.extensions?.code === 'FORBIDDEN')) {
            logger.warn(`getContentBlocksById (${id}): Permission denied`);
            return null;
        }
        logger.error(`Error in getContentBlocksById (${id}):`, error);
        throw new Error('Error in getContentBlocksById');
    }
}
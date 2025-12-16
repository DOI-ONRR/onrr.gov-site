import { createCollectionBlocksItemQuery } from '../../queries/collectionBlocks';
import { GraphQLClient } from "graphql-request";
import { logger } from '../../utils/logger';

export async function createCollectionBlocksItem(data, endpoint, authToken) {
    try {
        const variables = {
            data: data,
        };
        const client = new GraphQLClient(endpoint, {
            headers: {
                authorization: `Bearer ${authToken}`
            }
        });
        const response = await client.request(createCollectionBlocksItemQuery, variables);
        return response.create_collection_blocks_item.id;
    } catch (error) {
        logger.error("Error creating collection block:", error);
    }
}
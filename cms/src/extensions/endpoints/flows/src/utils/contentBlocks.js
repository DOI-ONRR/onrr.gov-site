import { createContentBlocksItem } from '../queries/contentBlocks';
import { GraphQLClient } from "graphql-request";
import { logger } from '../utils/logger';

export async function createContentBlock(data, endpoint, authToken) {
    try {
        const variables = {
            data: data,
        };
        const client = new GraphQLClient(endpoint, {
            headers: {
                authorization: `Bearer ${authToken}`
            }
        });
        const response = await client.request(createContentBlocksItem, variables);
        logger.info(JSON.stringify(response, null, 2));
        return response.create_content_blocks_item.id;
    } catch (error) {
        logger.error("Error creating content block:", error);
    }
}
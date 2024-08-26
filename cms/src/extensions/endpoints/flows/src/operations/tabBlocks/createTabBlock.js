import { createTabBlocksItem } from "../../queries/tabBlocks";
import { GraphQLClient } from "graphql-request";
import { logger } from '../../utils/logger';

export async function createTabBlock(data, endpoint, authToken) {
    try {
        const variables = {
            data: data,
        };
        const client = new GraphQLClient(endpoint, {
            headers: {
                authorization: `Bearer ${authToken}`
            }
        });
        const response = await client.request(createTabBlocksItem, variables);
        logger.info(JSON.stringify(response, null, 2));
        return response.create_tab_blocks_item.id;
    } catch (error) {
        logger.error("Error creating tab block:", error);
    }
}
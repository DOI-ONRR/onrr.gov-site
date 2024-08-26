import { createTabBlocksTabBlocksItems } from "../../queries/tabBlocks";
import { GraphQLClient } from "graphql-request";
import { logger } from '../../utils/logger';

export async function createTabBlocksTabBlocks(data, endpoint, authToken) {
    try {
        const variables = {
            data: data,
        };
        const client = new GraphQLClient(endpoint, {
            headers: {
                authorization: `Bearer ${authToken}`
            }
        });
        const response = await client.request(createTabBlocksTabBlocksItems, variables);
        return response;
    } catch (error) {
        logger.error("Error creating tab blocks tab blocks:", error);
    }
}
import { createCardBlocksItem } from "../../queries/cardBlocks";
import { GraphQLClient } from "graphql-request";
import { logger } from '../../utils/logger';

export async function createCardBlock(data, endpoint, authToken) {
    try {
        const variables = {
            data: data,
        };
        const client = new GraphQLClient(endpoint, {
            headers: {
                authorization: `Bearer ${authToken}`
            }
        });
        const response = await client.request(createCardBlocksItem, variables);
        return response.create_card_blocks_item.id;
    } catch (error) {
        logger.error("Error creating card block:", error);
        throw new Error('Error in createCardBlock');
    }
}
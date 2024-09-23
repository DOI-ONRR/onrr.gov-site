import { createPagesItemMutation } from "../../queries/pages";
import { GraphQLClient } from "graphql-request";
import { logger } from "../../utils/logger";

export async function createPagesItem(data, endpoint, authToken) {
    try {
        const variables = {
            data: data,
        };
        const client = new GraphQLClient(endpoint, {
            headers: {
                authorization: `Bearer ${authToken}`
            }
        });
        const response = await client.request(createPagesItemMutation, variables);
        return response.create_pages_item.id;
    } catch (error) {
        logger.error("Error creating pages item:", error);
        throw new Error('Error creating pages item. Check log files.')
    }
}
import { updatePagesItemMutation } from "../../queries/pages";
import { GraphQLClient } from "graphql-request";
import { logger } from "../../utils/logger";

export async function updatePagesItem(id, item, endpoint, authToken) {
    try {
        const variables = {
            id: id,
            item: item
        };
        const client = new GraphQLClient(endpoint, {
            headers: {
                authorization: `Bearer ${authToken}`
            }
        });
        const response = await client.request(updatePagesItemMutation, variables);
        logger.verbose('updatePagesItem: ', response);
    } catch (error) {
        logger.error('Error in updatePagesItem', error);
        throw new Error('Error in updatePagesItem');
    }
}
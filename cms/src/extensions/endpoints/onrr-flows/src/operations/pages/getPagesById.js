import { pagesByIdQuery } from "../../queries/pages";
import { GraphQLClient } from "graphql-request";
import { logger } from "../../utils/logger";

export async function getPagesById(pagesId, endpoint, authToken) {
    try {
        const client = new GraphQLClient(endpoint);
        if (authToken) {
            client.setHeaders({
                authorization: `Bearer ${authToken}`
            });
        }
        const data = await client.request(pagesByIdQuery, { id: pagesId });
        return data.pages_by_id;
    } catch (error) {
        logger.error("Error in getPagesById:", error);
        throw new Error('Error in getPagesById');
    }
}
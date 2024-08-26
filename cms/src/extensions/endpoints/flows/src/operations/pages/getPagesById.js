import { pagesByIdQuery } from "../../queries/pages";
import { GraphQLClient } from "graphql-request";
import { logger } from "../../utils/logger";

export async function getPagesById(pagesId, endpoint) {
    try {
        const variables = {
            id: pagesId,
        };
        const client = new GraphQLClient(endpoint);
        const data = await client.request(pagesByIdQuery, variables);
        return data.pages_by_id;
    } catch (error) {
        logger.error("Error in getPagesById:", error);
        throw new Error('Error in getPagesById');
    }
}
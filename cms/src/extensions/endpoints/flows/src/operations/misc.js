import { 
    getCreateMutation
} from "../queries/misc";
import { GraphQLClient } from "graphql-request";
import { logger } from "../utils/logger";

export async function createItemByCollection(collection, data, url, authToken) {
    try {
        const query = getCreateMutation(collection);
        const client = new GraphQLClient(url, {
            headers: {
                authorization: `Bearer ${authToken}`
            }
        });
        const response = await client.request(query, { data: data });
        return response[`create_${collection}_item`].id;
    }
    catch (error) {
        logger.error('Error in createItemByCollection', error);
        logger.info(`createItemByCollection (${collection}):\n ${JSON.stringify(data, null, 2)}`);
        throw new Error('Error in createItemByCollection');
    }
}
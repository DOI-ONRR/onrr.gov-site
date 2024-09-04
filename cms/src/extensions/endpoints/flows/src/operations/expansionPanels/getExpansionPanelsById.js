import { expansionPanelsById } from "../../queries/expansionPanels";
import { GraphQLClient } from "graphql-request";
import { logger } from '../../utils/logger';

export async function getExpansionPanelsById(id, endpoint, authToken) {
    try {
        const client = new GraphQLClient(endpoint);
        if (authToken) {
            client.setHeaders({
                authorization: `Bearer ${authToken}`
            });
        }
        const data = await client.request(expansionPanelsById, { id: id });
        return data.expansion_panels_by_id;
    }
    catch(error) {
        logger.error(`Error in getExpansionPanelsById (${id}):`, error);
        throw new Error('Error in getExpansionPanelsById');
    }
}
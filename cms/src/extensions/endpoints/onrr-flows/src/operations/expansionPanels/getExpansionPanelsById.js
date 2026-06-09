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
        if (error.response?.errors?.some(e => e.extensions?.code === 'FORBIDDEN')) {
            logger.warn(`getExpansionPanelsById (${id}): Permission denied`);
            return null;
        }
        logger.error(`Error in getExpansionPanelsById (${id}):`, error);
        throw new Error('Error in getExpansionPanelsById');
    }
}
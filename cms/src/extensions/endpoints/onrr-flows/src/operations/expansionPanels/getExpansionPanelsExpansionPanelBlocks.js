import { expansionPanelsExpansionPanelBlocks } from "../../queries/expansionPanels";
import { GraphQLClient } from "graphql-request";
import { logger } from '../../utils/logger';

export async function getExpansionPanelsExpansionPanelBlocks(id, endpoint, authToken) {
    try {
        const client = new GraphQLClient(endpoint);
        if (authToken) {
            client.setHeaders({
                authorization: `Bearer ${authToken}`
            });
        }
        
        const variables = {
            expansion_panel_id: {
                "_eq": id
            }
        }
        const data = await client.request(expansionPanelsExpansionPanelBlocks, variables);
        return data.expansion_panels_expansion_panel_blocks;
    }
    catch(error) {
        if (error.response?.errors?.some(e => e.extensions?.code === 'FORBIDDEN')) {
            logger.warn(`getExpansionPanelsExpansionPanelBlocks (${id}): Permission denied`);
            return [];
        }
        logger.error(`Error in getExpansionPanelsExpansionPanelBlocks (${id}):`, error);
        throw new Error('Error in getExpansionPanelsExpansionPanelBlocks');
    }
}
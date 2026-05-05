import { expansionPanelBlockLabelById } from "../../queries/expansionPanels";
import { GraphQLClient } from "graphql-request";
import { logger } from '../../utils/logger';

export async function getExpansionPanelBlockLabelById(id, endpoint) {
    try {
        const client = new GraphQLClient(endpoint);
        const data = await client.request(expansionPanelBlockLabelById, { id: id });
        return data.expansion_panel_block_label_by_id;
    }
    catch(error) {
        if (error.response?.errors?.some(e => e.extensions?.code === 'FORBIDDEN')) {
            logger.warn(`getExpansionPanelBlockLabelById (${id}): Permission denied`);
            return null;
        }
        logger.error(`Error in getExpansionPanelBlockLabelById (${id}):`, error);
        throw new Error('Error in getExpansionPanelBlockLabelById');
    }
}
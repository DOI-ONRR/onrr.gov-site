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
        logger.error(`Error in getExpansionPanelBlockLabelById (${id}):`, error);
        throw new Error('Error in getExpansionPanelBlockLabelById');
    }
}
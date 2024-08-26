import { deleteExpansionPanelsExpansionPanelBlocksItem } from "../../queries/expansionPanels";
import { GraphQLClient } from "graphql-request";
import { logger } from '../../utils/logger';

export async function deleteExpansionPanelBlocksItem(id, endpoint, authToken) {
    try {
        const client = new GraphQLClient(endpoint, {
            headers: {
                authorization: `Bearer ${authToken}`
            }
        });
        const response = await client.request(deleteExpansionPanelsExpansionPanelBlocksItem, { id: id });
        return response.delete_expansion_panels_expansion_panel_blocks_item.id;
    } catch (error) {
        logger.error("Error in deleteExpansionPanelBlocksItem:", error);
        throw new Error('Error in deleteExpansionPanelBlocksItem');
    }
}
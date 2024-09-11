import { updateExpansionPanelsExpansionPanelBlocksItemMutation } from "../../queries/expansionPanels";
import { GraphQLClient } from "graphql-request";
import { logger } from '../../utils/logger';

export async function updateExpansionPanelsExpansionPanelBlocksItem(item, endpoint, authToken) {
    try {
        const client = new GraphQLClient(endpoint, {
            headers: {
                authorization: `Bearer ${authToken}`
            }
        });
        const response = await client.request(updateExpansionPanelsExpansionPanelBlocksItemMutation, { id: item.id, item: item });
        return response.update_expansion_panels_expansion_panel_blocks_item.id;
    } catch (error) {
        logger.error('Error in updateExpansionPanelsExpansionPanelBlocksItem: ', error)
        throw new Error('Error in updateExpansionPanelsExpansionPanelBlocksItem');
    }
}
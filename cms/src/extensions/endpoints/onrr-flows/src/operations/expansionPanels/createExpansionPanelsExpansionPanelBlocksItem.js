import { createExpansionPanelsExpansionPanelBlocksItemMutation } from "../../queries/expansionPanels";
import { GraphQLClient } from "graphql-request";
import { logger } from '../../utils';

export async function createExpansionPanelsExpansionPanelBlocksItem(item, endpoint, authToken) {
    try {
        const client = new GraphQLClient(endpoint, {
            headers: {
                authorization: `Bearer ${authToken}`
            }
        });
        const response = await client.request(createExpansionPanelsExpansionPanelBlocksItemMutation, { item: item });
        return response.create_expansion_panels_expansion_panel_blocks_item.id;
    } catch (error) {
        logger.error("Error in createExpansionPanelsExpansionPanelBlocksItem:", error);
        throw new Error('Error in createExpansionPanelsExpansionPanelBlocksItem');
    }
}
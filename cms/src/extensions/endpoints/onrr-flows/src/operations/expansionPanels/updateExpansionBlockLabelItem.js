import { updateExpansionPanelBlockLabelItemMutation } from "../../queries/expansionPanels";
import { GraphQLClient } from "graphql-request";
import { logger } from '../../utils';

export async function updateExpansionBlockLabelItem(item, endpoint, authToken) {
    try {
        const client = new GraphQLClient(endpoint, {
            headers: {
                authorization: `Bearer ${authToken}`
            }
        });
        const response = await client.request(updateExpansionPanelBlockLabelItemMutation, { id: item.id, item: item });
        return response.update_expansion_panel_block_label_item.id;
    } catch (error) {
        logger.error("Error in updateExpansionBlockLabelItem:", error);
    }
}
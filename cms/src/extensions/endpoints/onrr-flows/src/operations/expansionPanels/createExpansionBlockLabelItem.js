import { createExpansionPanelBlockLabelItemMutation } from "../../queries/expansionPanels";
import { GraphQLClient } from "graphql-request";
import { logger } from '../../utils/logger';

export async function createExpansionBlockLabelItem(data, endpoint, authToken) {
    try {
        const client = new GraphQLClient(endpoint, {
            headers: {
                authorization: `Bearer ${authToken}`
            }
        });
        const response = await client.request(createExpansionPanelBlockLabelItemMutation, { data: data });
        return response.create_expansion_panel_block_label_item.id;
    } catch (error) {
        logger.error("Error in createExpansionBlockLabelItem:", error);
    }
}
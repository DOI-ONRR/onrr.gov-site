import { createExpansionPanelsExpansionPanelBlocksItems } from "../../queries/expansionPanels";
import { GraphQLClient } from "graphql-request";
import { logger } from '../../utils/logger';

export async function createExpansionPanelBlocksItems(data, endpoint, authToken) {
    try {
        const client = new GraphQLClient(endpoint, {
            headers: {
                authorization: `Bearer ${authToken}`
            }
        });
        const response = await client.request(createExpansionPanelsExpansionPanelBlocksItems, { data: data });
        return response.create_expansion_panels_expansion_panel_blocks_items;
    } catch (error) {
        logger.error("Error in createExpansionPanelBlocksItems:", error);
    }
}
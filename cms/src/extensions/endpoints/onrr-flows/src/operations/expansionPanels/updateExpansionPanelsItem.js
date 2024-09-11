import { updateExpansionPanelItemMutation } from "../../queries/expansionPanels";
import { GraphQLClient } from "graphql-request";
import { logger } from '../../utils/logger';

export async function updateExpansionPanelsItem(item, endpoint, authToken) {
    try {
        const client = new GraphQLClient(endpoint, {
            headers: {
                authorization: `Bearer ${authToken}`
            }
        });
        const response = await client.request(updateExpansionPanelItemMutation, { id: item.id, item: item });
        return response.update_expansion_panels_item.id;
    } catch (error) {
        logger.error('Error in updateExpansionPanelsItem', error);
        throw new Error('Error in updateExpansionPanelsItem');
    }
}
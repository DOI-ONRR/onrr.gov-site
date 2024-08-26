import { updateTabBlockLabelItemMutation } from "../../queries/tabBlocks";
import { GraphQLClient } from "graphql-request";
import { logger } from '../../utils/logger';

export async function updateTabBlockLabelItem(id, item, endpoint, authToken) {
    try {
        const client = new GraphQLClient(endpoint, {
            headers: {
                authorization: `Bearer ${authToken}`
            }
        });
        const response = await client.request(updateTabBlockLabelItemMutation, { id: id, item: item });
        return response.update_tab_block_label_item;
    } catch (error) {
        logger.error("Error in updateTabBlockLabelItem:", error);
        throw new Error('Error in updateTabBlockLabelItem');
    }
}
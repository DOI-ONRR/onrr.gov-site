import { createTabBlocksTabBlocksItemMutation } from "../../queries/tabBlocks";
import { GraphQLClient } from "graphql-request";
import { logger } from '../../utils/logger';

export async function createTabBlocksTabBlocksItem(item, endpoint, authToken) {
    try {
        const client = new GraphQLClient(endpoint, {
            headers: {
                authorization: `Bearer ${authToken}`
            }
        });
        const response = await client.request(createTabBlocksTabBlocksItemMutation, { data: item });
        return response.create_tab_blocks_tab_blocks_item.id;
    } catch (error) {
        logger.error('Error in createTabBlocksTabBlocksItem: ', error)
        throw new Error('Error in createTabBlocksTabBlocksItem');
    }
}
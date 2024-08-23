import { 
    tabBlocksById, 
    tabBlocksByIdWithTabBlocks, 
    createTabBlocksItem, 
    createTabBlocksTabBlocksItems,
    createTabBlocksTabBlocksItemMutation,
    createTabBlockLabel,
    tabBlocksTabBlocks,
    tabBlocksTabBlocksById,
    tabBlockLabelById,
    updateTabBlockLabelItemMutation,
    updateTabBlocksItemMution,
    updateTabBlocksTabBlocksItemMutation
} from "../queries/tabBlocks";
import { GraphQLClient } from "graphql-request";
import { logger } from '../utils/logger';

export async function getTabBlocksById(tabBlocksId, endpoint) {
    try {
        const variables = {
            id: tabBlocksId,
        };
        const client = new GraphQLClient(endpoint);
        const data = await client.request(tabBlocksById, variables);
        return data.tab_blocks_by_id;
    } catch (error) {
        logger.error("Error fetching data:", error);
    }
}

export async function getTabBlockLabelById(id, endpoint) {
    try {
        const client = new GraphQLClient(endpoint);
        const data = await client.request(tabBlockLabelById, { id: id });
        //logger.info('getTabBlockLabelById', data);
        return data.tab_block_label_by_id;
    } catch (error) {
        logger.error("Error in getTabBlockLabelById:", error);
    }
}

export async function getTabBlocksTabBlocks(tabBlocksId, endpoint) {
    try {
        const client = new GraphQLClient(endpoint);
        const data = await client.request(tabBlocksTabBlocks, { tabBlocksId: tabBlocksId });
        return data.tab_blocks_tab_blocks;
    } catch (error) {
        logger.error("Error in getTabBlocksTabBlocks:", error);
    }
}

export async function getTabBlocksTabBlocksById(tabBlocksTabBlocksId, endpoint) {
    try {
        const client = new GraphQLClient(endpoint);
        const data = await client.request(tabBlocksTabBlocksById, { id: tabBlocksTabBlocksId });
        return data.tab_blocks_tab_blocks_by_id;
    } catch (error) {
        logger.error("Error in getTabBlocksTabBlocksById:", error);
    }
}

export async function getTabBlocksByIdWithTabBlocks(tabBlocksId, endpoint) {
    try {
        const client = new GraphQLClient(endpoint);
        const data = await client.request(tabBlocksByIdWithTabBlocks, { id: tabBlocksId });
        return data;
    } catch (error) {
        logger.error("Error in getTabBlocksByIdWithTabBlocks:", error);
        throw new Error('Error in getTabBlocksByIdWithTabBlocks');
    }
}

export async function createTabBlock(data, endpoint, authToken) {
    try {
        const variables = {
            data: data,
        };
        const client = new GraphQLClient(endpoint, {
            headers: {
                authorization: `Bearer ${authToken}`
            }
        });
        const response = await client.request(createTabBlocksItem, variables);
        logger.info(JSON.stringify(response, null, 2));
        return response.create_tab_blocks_item.id;
    } catch (error) {
        logger.error("Error creating tab block:", error);
    }
}

export async function createTabBlockLabelItem(data, endpoint, authToken) {
    try {
        const variables = {
            data: data,
        };
        const client = new GraphQLClient(endpoint, {
            headers: {
                authorization: `Bearer ${authToken}`
            }
        });
        const response = await client.request(createTabBlockLabel, variables);
        logger.info(JSON.stringify(response, null, 2));
        return response.create_tab_block_label_item.id;
    } catch (error) {
        logger.error("Error creating tab block label:", error);
    }
}

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

export async function createTabBlocksTabBlocks(data, endpoint, authToken) {
    try {
        const variables = {
            data: data,
        };
        const client = new GraphQLClient(endpoint, {
            headers: {
                authorization: `Bearer ${authToken}`
            }
        });
        const response = await client.request(createTabBlocksTabBlocksItems, variables);
        return response;
    } catch (error) {
        logger.error("Error creating tab blocks tab blocks:", error);
    }
}

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

export async function updateTabBlocksItem(id, item, endpoint, authToken) {
    try {
        const client = new GraphQLClient(endpoint, {
            headers: {
                authorization: `Bearer ${authToken}`
            }
        });
        const response = await client.request(updateTabBlocksItemMution, { id: id, item: item });
        return response.update_tab_blocks_item;
    } catch (error) {
        logger.error('Error in updateTabBlocksItem: ', error)
        throw new Error('Error in updateTabBlocksItem');
    }
}

export async function updateTabBlocksTabBlocksItem(item, endpoint, authToken) {
    try {
        logger.info('updateTabBlocksTabBlocksItem: \n', item);
        const client = new GraphQLClient(endpoint, {
            headers: {
                authorization: `Bearer ${authToken}`
            }
        });
        const response = await client.request(updateTabBlocksTabBlocksItemMutation, { id: item.id, item: item });
        return response.update_tab_blocks_tab_blocks_item;
    } catch (error) {
        logger.error('Error in updateTabBlocksTabBlocksItem: ', error)
        throw new Error('Error in updateTabBlocksTabBlocksItem');
    }
}
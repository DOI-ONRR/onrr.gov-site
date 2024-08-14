import { 
    expansionPanelsById, 
    expansionPanelsExpansionPanelBlocks, 
    expansionPanelBlockLabelById, 
    createExpansionPanelBlockLabelItem as createExpansionPanelBlockLabelItemQuery,
    createExpansionPanelsExpansionPanelBlocksItems,
    deleteExpansionPanelsExpansionPanelBlocksItem
} from "../queries/expansionPanels";
import { GraphQLClient } from "graphql-request";
import { logger } from '../utils/logger';

export async function getExpansionPanelsById(id, endpoint) {
    try {
        const client = new GraphQLClient(endpoint);
        const data = await client.request(expansionPanelsById, { id: id });
        return data.expansion_panels_by_id;
    }
    catch(error) {
        logger.error(`Error in getExpansionPanelsById (${id}):`, error);
        throw new Error('Error in getExpansionPanelsById');
    }
}

export async function getExpansionPanelsExpansionPanelBlocks(id, endpoint) {
    try {
        const client = new GraphQLClient(endpoint);
        const variables = {
            expansion_panel_id: {
                "_eq": id
            }
        }
        const data = await client.request(expansionPanelsExpansionPanelBlocks, variables);
        return data.expansion_panels_expansion_panel_blocks;
    }
    catch(error) {
        logger.error(`Error in getExpansionPanelsExpansionPanelBlocks (${id}):`, error);
        throw new Error('Error in getExpansionPanelsExpansionPanelBlocks');
    }
}

export async function getExpansionPanelBlockLabelById(id, endpoint) {
    try {
        const client = new GraphQLClient(endpoint);
        const data = await client.request(expansionPanelBlockLabelById, { id: id });
        return data.expansion_panel_block_label_by_id;
    }
    catch(error) {
        logger.error(`Error in getExpansionPanelBlockLabelById (${id}):`, error);
        throw new Error('Error in getExpansionPanelBlockLabelById');
    }
}

export async function createExpansionBlockLabelItem(data, endpoint, authToken) {
    try {
        const client = new GraphQLClient(endpoint, {
            headers: {
                authorization: `Bearer ${authToken}`
            }
        });
        const response = await client.request(createExpansionPanelBlockLabelItemQuery, { data: data });
        return response.create_expansion_panel_block_label_item.id;
    } catch (error) {
        logger.error("Error in createExpansionBlockLabelItem:", error);
    }
}

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
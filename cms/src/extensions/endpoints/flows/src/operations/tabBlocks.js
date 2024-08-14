import { tabBlocksById, tabBlocksByIdFull, createTabBlocksItem, createTabBlocksTabBlocksItems, createTabBlockLabel } from "../queries/tabBlocks";
import { GraphQLClient } from "graphql-request";
import { logger } from '../utils/logger';

export async function getTabBlocksById(tabBlocksId, endpoint) {
    try {
        const variables = {
            id: tabBlocksId,
        };
        const client = new GraphQLClient(endpoint);
        const data = await client.request(tabBlocksById, variables);
        return data;
    } catch (error) {
        logger.error("Error fetching data:", error);
    }
}

export async function getTabBlocksByIdFull(tabBlocksId, endpoint) {
    try {
        const variables = {
            id: tabBlocksId,
        };
        const client = new GraphQLClient(endpoint);
        const data = await client.request(tabBlocksByIdFull, variables);
        return data;
    } catch (error) {
        logger.error("Error fetching data:", error);
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
        return response.data.create_tab_blocks_item.id;
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
        logger.info(JSON.stringify(response, null, 2));
        return response;
    } catch (error) {
        logger.error("Error creating tab blocks tab blocks:", error);
    }
}
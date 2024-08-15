import { 
    pagesById as pagesByIdQuery, 
    createPagesItemMutation,
    createPagesPageBlocksItemsMutation,
    pagesByIdDeepQuery,
    pagesPageBlocks as pagesPageBlocksQuery,
    pagesPageBlocksItemByPageBlockId,
    updatePagesItemMutation
} from "../queries/pages";
import { GraphQLClient } from "graphql-request";
import { logger } from "../utils/logger";

export async function pagesById(pagesId, endpoint) {
    try {
        const variables = {
            id: pagesId,
        };
        const client = new GraphQLClient(endpoint);
        const data = await client.request(pagesByIdQuery, variables);
        return data.pages_by_id;
    } catch (error) {
        logger.error("Error fetching pages by id:", error);
    }
}

export async function getPagesByIdDeep(pagesId, endpoint) {
    try {
        const client = new GraphQLClient(endpoint);
        const data = await client.request(pagesByIdDeepQuery, { id: pagesId });
        return data;
    } catch (error) {
        logger.error("Error fetching pages (full) by id:", error);
    }
}

export async function pagesPageBlocks(pagesId, endpoint) {
    try {
        const variables = {
            pages_id: pagesId,
        };
        const client = new GraphQLClient(endpoint);
        const data = await client.request(pagesPageBlocksQuery, variables);
        return data.pages_page_blocks;
    } catch (error) {
        logger.error("Error in getPagesPageBlocks:", error);
    }
}

export async function getPagesPageBlockItemByPageBlockId(pageBlockId, endpoint) {
    try {
        const client = new GraphQLClient(endpoint);
        const data = await client.request(pagesPageBlocksItemByPageBlockId, { id: pageBlockId });
        return data.pages_page_blocks_by_id.item;
    } catch (error) {
        logger.error(`Error in getPagesPageBlockItemByPageBlockId (${pageBlockId}):`, error);
    }
}

export async function createPagesItem(data, endpoint, authToken) {
    try {
        const variables = {
            data: data,
        };
        const client = new GraphQLClient(endpoint, {
            headers: {
                authorization: `Bearer ${authToken}`
            }
        });
        const response = await client.request(createPagesItemMutation, variables);
        return response.create_pages_item.id;
    } catch (error) {
        logger.error("Error creating pages item:", error);
        throw new Error('Error creating pages item. Check log files.')
    }
}

export async function createPagesPageBlocksItems(data, endpoint, authToken) {
    try {
        const variables = {
            items: data,
        };
        const client = new GraphQLClient(endpoint, {
            headers: {
                authorization: `Bearer ${authToken}`
            }
        });
        const response = await client.request(createPagesPageBlocksItemsMutation, variables);
        return response.create_pages_page_blocks_items;
    } catch (error) {
        logger.error("Error in createPagesPageBlocksItems:", error);
        throw new Error('Error in createPagesPageBlocksItems. Check log files.')
    }
}

export async function updatePagesItem(id, item, endpoint, authToken) {
    try {
        const variables = {
            id: id,
            item: item
        };
        const client = new GraphQLClient(endpoint, {
            headers: {
                authorization: `Bearer ${authToken}`
            }
        });
        const response = await client.request(updatePagesItemMutation, variables);
        logger.verbose('updatePagesItem: ', response);
    } catch (error) {
        logger.error('Error in updatePagesItem', error);
        throw new Error('Error in updatePagesItem');
    }
}
import { tabBlockLabelById } from "../../queries/tabBlocks";
import { GraphQLClient } from "graphql-request";
import { logger } from '../../utils/logger';

export async function getTabBlockLabelById(id, endpoint) {
    try {
        const client = new GraphQLClient(endpoint);
        const data = await client.request(tabBlockLabelById, { id: id });
        return data.tab_block_label_by_id;
    } catch (error) {
        if (error.response?.errors?.some(e => e.extensions?.code === 'FORBIDDEN')) {
            logger.warn(`getTabBlockLabelById (${id}): Permission denied`);
            return null;
        }
        logger.error("Error in getTabBlockLabelById:", error);
    }
}
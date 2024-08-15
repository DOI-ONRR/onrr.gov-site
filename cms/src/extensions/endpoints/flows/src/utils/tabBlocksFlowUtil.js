import { 
    getTabBlocksById,
    getTabBlocksTabBlocks,
    createTabBlock,
    getTabBlockLabelById,
    createTabBlockLabelItem,
    createTabBlocksTabBlocks,
    updateTabBlockLabelItem
} from '../operations/tabBlocks';
import { run as runCardBlocksFlow } from '../utils/cardBlocksFlowUtil';
import { run as runContentBlocksFlow } from '../utils/contentBlocksFlowUtil';
import { run as runExpansionPanelsFlow } from '../utils/expansionPanelsFlowUtil';
import { Endpoints, AuthToken, CollectionTypes, ApiMessages } from "../constants";
import { diff } from "deep-diff";
import { logger } from "./logger";

export async function runTabBlockLabelItemFlow(id) {
    try {
        const latest = await getTabBlockLabelById(id, Endpoints.LOCAL);
        const previous = await getTabBlockLabelById(id, Endpoints.UPSTREAM);
        const changes = diff(previous, latest);
        logger.info(`tabBlocksFlowUtil.runTabBlockLabelItemFlow:\n ${JSON.stringify(changes, null, 2)}`);
        if (!changes) {
            return {
                id: id,
                collection: CollectionTypes.TAB_BLOCK_LABEL,
                message: ApiMessages.NO_CHANGES
            }
        }
        for (const change of changes) {
            if (change.kind === 'E' && !change.lhs) {
                const createdId = await createTabBlockLabelItem(firstChange.rhs, Endpoints.UPSTREAM, AuthToken);
                return {
                    id: createdId,
                    collection: CollectionTypes.TAB_BLOCK_LABEL,
                    message: ApiMessages.ITEM_CREATED
                }
            }
            if (change.kind === 'E') {
                const updatedItem = await updateTabBlockLabelItem(id, latest, Endpoints.UPSTREAM, AuthToken);
                return {
                    item: updatedItem,
                    collection: CollectionTypes.TAB_BLOCK_LABEL,
                    message: ApiMessages.ITEM_UPDATED
                }
            }
        }
    }
    catch(error) {
        logger.error('Error in runExpansionPanelBlockLabelItemFlow:', error);
    }
}

async function runTabBlocksTabBlocksFlow(data) {
    try {
        await createTabBlocksTabBlocks(data, Endpoints.UPSTREAM, AuthToken);
        logger.info(`Creating tab_blocks_tab_blocks:\n`, data);
    } catch (error) {
        logger.error(`Error in runTabBlocksTabBlocksFlow (${id}):`, error)
        throw new Error('Error in runTabBlocksTabBlocksFlow');
    }
}

export async function run(id) {
    try {
        const latest = await getTabBlocksById(id, Endpoints.LOCAL);
        const previous = await getTabBlocksById(id, Endpoints.UPSTREAM);
        const changes = diff(previous, latest);
        logger.info(`tabBlocksFlowUtil.run:\n ${JSON.stringify(changes, null, 2)}`);
        if (!changes) {
            return {
                id: id,
                collection: CollectionTypes.TAB_BLOCKS,
                message: ApiMessages.NO_CHANGES
            }
        }
        const firstChange = changes[0];
        if (firstChange.kind == 'E' && !firstChange.lhs) {
            const createdId = await createTabBlock(firstChange.rhs, Endpoints.UPSTREAM, AuthToken);
            logger.info(`Creating tab block with id ${id}`);
            var tabBlockItems = [];
            const tabBlocksTabBlocks = await getTabBlocksTabBlocks(id, Endpoints.LOCAL);
            for (let block of tabBlocksTabBlocks) {
                let response = {};
                switch (block.item.collection) {
                    case CollectionTypes.TAB_BLOCK_LABEL:
                        response = await runTabBlockLabelItemFlow(block.item.id);
                        break;
                    case CollectionTypes.CONTENT_BLOCKS:
                        response = await runContentBlocksFlow(block.item.id);
                        break;
                    case CollectionTypes.CARD_BLOCKS:
                        response = await runCardBlocksFlow(block.item.id);
                        break;
                    case CollectionTypes.EXPANSION_PANELS:
                        response = await runExpansionPanelsFlow(block.item.id);
                        break;
                    case CollectionTypes.TAB_BLOCKS:
                        response = await run(block.item.id);
                        break;
                }
                tabBlockItems.push({
                    id: block.id,
                    Sort: block.sort,
                    item: response.id,
                    collection: block.item.collection,
                    tab_blocks_id: {
                        id: id
                    }
                })
            }
            await runTabBlocksTabBlocksFlow(tabBlockItems);
            return {
                id: createdId,
                collection: CollectionTypes.TAB_BLOCKS,
                message: ApiMessages.ITEM_CREATED
            }
        }
    }
    catch(error) {
        logger.error(`Error in tabBlocksFlowUtil.run (${id}):`, error)
        throw new Error('Error in tabBlocksFlowUtil.run');
    }
}
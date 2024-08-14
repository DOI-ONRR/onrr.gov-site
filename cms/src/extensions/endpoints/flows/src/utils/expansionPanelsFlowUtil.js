import { 
    getExpansionPanelBlockLabelById, 
    getExpansionPanelsById, 
    getExpansionPanelsExpansionPanelBlocks,
    createExpansionBlockLabelItem,
    createExpansionPanelBlocksItems} from '../operations/expansionPanels';
import { Endpoints, AuthToken, CollectionTypes, ApiMessages } from "../constants";
import { run as runCardBlocksFlow } from '../utils/cardBlocksFlowUtil';
import { run as runContentBlocksFlow } from '../utils/contentBlocksFlowUtil';
import { diff } from "deep-diff";
import { logger } from "./logger";

async function runExpansionPanelBlockLabelItemFlow(id) {
    try {
        const latest = await getExpansionPanelBlockLabelById(id, Endpoints.LOCAL);
        const previous = await getExpansionPanelBlockLabelById(id, Endpoints.UPSTREAM);
        const changes = diff(previous, latest);
        logger.info(`expansionPanelsFlowUtil.runExpansionPanelBlockLabelItemFlow:\n ${JSON.stringify(changes, null, 2)}`);
        if (changes.length === 0) {
            return {
                id: id,
                collection: CollectionTypes.EXPANSION_PANEL_BLOCK_LABEL,
                message: ApiMessages.NO_CHANGES
            }
        }
        const firstChange = changes[0];
        if (firstChange.kind == 'E' && !firstChange.lhs) {
            //const createdId = await createExpansionBlockLabelItem(firstChange.rhs, Endpoints.UPSTREAM, AuthToken);
            const createdId = id;
            logger.info(`Creating expansion panel block label with id ${id}`);
            return {
                id: createdId,
                collection: CollectionTypes.EXPANSION_PANEL_BLOCK_LABEL,
                message: ApiMessages.ITEM_CREATED
            }
        }
    }
    catch(error) {
        logger.error('Error in runExpansionPanelBlockLabelItemFlow:', error);
    }
}

async function runExpansionPanelBlocksFlow(id, data) {
    try {
        
    } catch (error) {
        logger.error(`Error in runExpansionPanelBlocksFlow (${id}):`, error)
        throw new Error('Error in runExpansionPanelBlocksFlow');
    }
}

export async function run(id) {
    try {
        const latest = await getExpansionPanelsById(id, Endpoints.LOCAL);
        const previous = await getExpansionPanelsById(id, Endpoints.UPSTREAM);
        const changes = diff(previous, latest);
        logger.info(`expansionPanelsFlowUtil.run:\n ${JSON.stringify(changes, null, 2)}`);
        if (changes.length === 0) {
            return {
                id: id,
                collection: CollectionTypes.EXPANSION_PANELS,
                message: ApiMessages.NO_CHANGES
            }
        }
        const firstChange = changes[0];
        if (firstChange.kind == 'E' && !firstChange.lhs) {
            //const createdId = await createExpansionPanelBlockItem(firstChange.rhs, Endpoints.UPSTREAM, AuthToken);
            const createdId = id;
            logger.info(`Creating expansion panel with id ${id}`);
            const expansionPanelBlocks = await getExpansionPanelsExpansionPanelBlocks(id, Endpoints.LOCAL);
            for (let block of expansionPanelBlocks) {
                let response = {};
                switch (block.collection) {
                    case CollectionTypes.EXPANSION_PANEL_BLOCK_LABEL:
                        response = await runExpansionPanelBlockLabelItemFlow(block.item.id);
                        break;
                    case CollectionTypes.CONTENT_BLOCKS:
                        response = await runContentBlocksFlow(block.item.id);
                        break;
                    case CollectionTypes.CARD_BLOCKS:
                        response = await runCardBlocksFlow(block.item.id);
                        break;
                }
            }
            return {
                id: createdId,
                collection: CollectionTypes.EXPANSION_PANELS,
                message: ApiMessages.ITEM_CREATED
            }
        }
    }
    catch {
        logger.error(`Error in expansionPanelsFlowUtil.run (${id}):`, error)
        throw new Error('Error in expansionPanelsFlowUtil.run');
    }
}
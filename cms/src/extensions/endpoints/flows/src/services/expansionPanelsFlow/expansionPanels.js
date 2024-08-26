import { 
    getExpansionPanelsById, 
    getExpansionPanelsExpansionPanelBlocks,
    createExpansionPanelsItem,
    createExpansionPanelBlocksItems} from '../../operations/expansionPanels';
import { Endpoints, AuthToken, CollectionTypes, ApiMessages } from "../../constants";
import { runCardBlocks } from '../cardBlocksFlow';
import { runContentBlocks } from '../contentBlocksFlow';
import diff from "deep-diff";
import { logger } from "../../utils/logger";

export async function runExpansionPanels(id) {
    try {
        const latest = await getExpansionPanelsById(id, Endpoints.LOCAL);
        const previous = await getExpansionPanelsById(id, Endpoints.UPSTREAM);
        const changes = diff(previous, latest);
        if (!changes) {
            return {
                id: id,
                collection: CollectionTypes.EXPANSION_PANELS,
                message: ApiMessages.NO_CHANGES
            }
        }
        const firstChange = changes[0];
        if (firstChange.kind == 'E' && !firstChange.lhs) {
            const createdId = await createExpansionPanelsItem(firstChange.rhs, Endpoints.UPSTREAM, AuthToken);
            logger.info(`Creating expansion panel with id ${id}`);
            var createExpansionPanelsExpansionPanelBlocksInput = [];
            const expansionPanelBlocks = await getExpansionPanelsExpansionPanelBlocks(id, Endpoints.LOCAL);
            for (let block of expansionPanelBlocks) {
                let response = {};
                switch (block.collection) {
                    case CollectionTypes.EXPANSION_PANEL_BLOCK_LABEL:
                        response = await runExpansionPanelBlockLabelItemFlow(block.item.id);
                        break;
                    case CollectionTypes.CONTENT_BLOCKS:
                        response = await runContentBlocks(block.item.id);
                        break;
                    case CollectionTypes.CARD_BLOCKS:
                        response = await runCardBlocks(block.item.id);
                        break;
                }
                createExpansionPanelsExpansionPanelBlocksInput.push({
                    id: block.id,
                    expansion_panels_id: {
                        id: id
                    },
                    item: response.id,
                    collection: block.collection,
                    sort: block.sort
                })
            }
            await createExpansionPanelBlocksItems(data, Endpoints.UPSTREAM, AuthToken);
            return {
                id: createdId,
                collection: CollectionTypes.EXPANSION_PANELS,
                message: ApiMessages.ITEM_CREATED
            }
        }
    }
    catch(error) {
        logger.error(`Error in runExpansionPanels (${id}):`, error)
        throw new Error('Error in runExpansionPanels');
    }
}
import { 
    getPagesById, 
    createPagesItem,
    updatePagesItem
} from '../../operations/pages';
import { runPagesPageBlocks } from './pagesPageBlocks';
import { Endpoints, AuthToken, CollectionTypes, ApiMessages } from "../../constants";
import diff from "deep-diff";
import { logger } from "../../utils/logger";

export async function runPages(id) {
    try {
        var appliedChanges = [];
        const latest = await getPagesById(id, Endpoints.LOCAL);
        const previous = await getPagesById(id, Endpoints.UPSTREAM);
        const changes = diff(previous, latest);
        if (!changes) {
            appliedChanges.push({
                id: id,
                collection: CollectionTypes.PAGES,
                message: ApiMessages.NO_CHANGES
            });
        } else {
            for (const change of changes) {
                if (change.kind == 'N' && !change.lhs && !Object.hasOwn(change, 'path')) {
                    const newId = await createPagesItem(latest, Endpoints.UPSTREAM, AuthToken);
                    appliedChanges.push({
                        id: newId,
                        collection: CollectionTypes.PAGES,
                        message: ApiMessages.ITEM_CREATED
                    });
                }
                if (change.kind == 'E' && Object.hasOwn(change, 'path')) {
                    const updateId = await updatePagesItem(id, latest, Endpoints.UPSTREAM, AuthToken);
                    appliedChanges.push({
                        id: updateId,
                        collection: CollectionTypes.PAGES,
                        message: ApiMessages.ITEM_UPDATED
                    });
                }
            }
        }
        const pagesPageBlocksResults = await runPagesPageBlocks(id);
        return appliedChanges.concat(pagesPageBlocksResults);
    }
    catch {
        logger.error(`Error in runPages (${id}):`, error)
        throw new Error('Error in runPages');
    }
}
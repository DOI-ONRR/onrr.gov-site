import { 
    getPagesById, 
    createPagesItem,
    updatePagesItem
} from '../../operations/pages';
import { runPagesPageBlocks } from './pagesPageBlocks';
import { Endpoints, UpstreamAuthToken, LocalAuthToken, CollectionTypes, ApiMessages } from "../../constants";
import { logger, previousVersionExists, versionsDiffer } from "../../utils";

export async function runPages(id) {
    try {
        var appliedChanges = [];
        const latest = await getPagesById(id, Endpoints.LOCAL, LocalAuthToken);
        const previous = await getPagesById(id, Endpoints.UPSTREAM, UpstreamAuthToken);
        if (!previousVersionExists(previous)) {
            const newId = await createPagesItem(latest, Endpoints.UPSTREAM, UpstreamAuthToken);
            appliedChanges.push({
                id: newId,
                collection: CollectionTypes.PAGES,
                message: ApiMessages.ITEM_CREATED
            });
        } else if (versionsDiffer(previous, latest)) {
            const updateId = await updatePagesItem(id, latest, Endpoints.UPSTREAM, UpstreamAuthToken);
            appliedChanges.push({
                id: updateId,
                collection: CollectionTypes.PAGES,
                message: ApiMessages.ITEM_UPDATED
            });
        }
        const pagesPageBlocksResults = await runPagesPageBlocks(id);
        return pagesPageBlocksResults.length > 0 
            ? appliedChanges.concat(pagesPageBlocksResults) 
            : appliedChanges;
    }
    catch (error) {
        logger.error(`Error in runPages (${id}):`, error)
        throw new Error('Error in runPages');
    }
}
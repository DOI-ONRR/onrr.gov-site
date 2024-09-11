import { 
    getExpansionPanelsById, 
    createExpansionPanelsItem, 
    updateExpansionPanelsItem} from '../../operations/expansionPanels';
import { runExpansionPanelsExpansionPanelBlocks } from './expansionPanelsExpansionPanelBlocks';
import { Endpoints, UpstreamAuthToken, LocalAuthToken, CollectionTypes, ApiMessages } from "../../constants";
import { logger, versionsDiffer, previousVersionExists } from "../../utils";

export async function runExpansionPanels(id) {
    try {
        var appliedChanges = [];
        const latest = await getExpansionPanelsById(id, Endpoints.LOCAL, LocalAuthToken);
        const previous = await getExpansionPanelsById(id, Endpoints.UPSTREAM, UpstreamAuthToken);
        if (!previousVersionExists(previous)) {
            const createdId = await createExpansionPanelsItem(latest, Endpoints.UPSTREAM, UpstreamAuthToken);
            appliedChanges.push({
                id: createdId,
                collection: CollectionTypes.EXPANSION_PANELS,
                message: ApiMessages.ITEM_CREATED
            })
        } else if (versionsDiffer(previous, latest)) {
            const updatedId = await updateExpansionPanelsItem(latest, Endpoints.UPSTREAM, UpstreamAuthToken);
            appliedChanges.push({
                id: updatedId,
                collection: CollectionTypes.EXPANSION_PANELS,
                message: ApiMessages.ITEM_UPDATED
            })
        }
        const expansionPanelsExpansionPanelBlocksChanges = await runExpansionPanelsExpansionPanelBlocks(id);
        return expansionPanelsExpansionPanelBlocksChanges.length > 0
            ? appliedChanges.concat(expansionPanelsExpansionPanelBlocksChanges)
            : appliedChanges;
        
    }
    catch(error) {
        logger.error(`Error in runExpansionPanels (${id}):`, error)
        throw new Error('Error in runExpansionPanels');
    }
}
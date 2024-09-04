import { getExpansionPanelBlockLabelById, createExpansionBlockLabelItem, updateExpansionBlockLabelItem } from '../../operations/expansionPanels';
import { Endpoints, UpstreamAuthToken, CollectionTypes, ApiMessages } from "../../constants";
import { logger, previousVersionExists, versionsDiffer } from "../../utils";

export async function runExpansionPanelBlockLabel(id) {
    try {
        const latest = await getExpansionPanelBlockLabelById(id, Endpoints.LOCAL);
        const previous = await getExpansionPanelBlockLabelById(id, Endpoints.UPSTREAM);
        if (!previousVersionExists(previous)) {
            const createdId = await createExpansionBlockLabelItem(latest, Endpoints.UPSTREAM, UpstreamAuthToken);
            return {
                id: createdId,
                collection: CollectionTypes.EXPANSION_PANEL_BLOCK_LABEL,
                message: ApiMessages.ITEM_CREATED
            }    
        } else if (versionsDiffer(previous, latest)) {
            const updatedId = await updateExpansionBlockLabelItem(latest, Endpoints.UPSTREAM, UpstreamAuthToken);
            return {
                id: updatedId,
                collection: CollectionTypes.EXPANSION_PANEL_BLOCK_LABEL,
                message: ApiMessages.ITEM_UPDATED
            }
        }
        return null;
    }
    catch(error) {
        logger.error('Error in runExpansionPanelBlockLabel:', error);
    }
}
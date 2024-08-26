import { getExpansionPanelBlockLabelById, createExpansionBlockLabelItem } from '../../operations/expansionPanels';
import { Endpoints, AuthToken, CollectionTypes, ApiMessages } from "../../constants";
import diff from "deep-diff";
import { logger } from "../../utils/logger";

export async function runExpansionPanelBlockLabel(id) {
    try {
        const latest = await getExpansionPanelBlockLabelById(id, Endpoints.LOCAL);
        const previous = await getExpansionPanelBlockLabelById(id, Endpoints.UPSTREAM);
        const changes = diff(previous, latest);
        if (!changes) {
            return {
                id: id,
                collection: CollectionTypes.EXPANSION_PANEL_BLOCK_LABEL,
                message: ApiMessages.NO_CHANGES
            }
        }
        const firstChange = changes[0];
        if (firstChange.kind == 'E' && !firstChange.lhs) {
            const createdId = await createExpansionBlockLabelItem(firstChange.rhs, Endpoints.UPSTREAM, AuthToken);
            return {
                id: createdId,
                collection: CollectionTypes.EXPANSION_PANEL_BLOCK_LABEL,
                message: ApiMessages.ITEM_CREATED
            }
        }
    }
    catch(error) {
        logger.error('Error in runExpansionPanelBlockLabel:', error);
    }
}
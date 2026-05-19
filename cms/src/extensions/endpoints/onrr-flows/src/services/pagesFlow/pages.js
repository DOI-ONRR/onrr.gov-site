import {
    getPagesById,
    createPagesItem,
    updatePagesItem
} from '../../operations/pages';
import { updatePageHeroImage } from '../../operations/pages/updatePageHeroImage';
import { runPagesPageBlocks } from './pagesPageBlocks';
import { Endpoints, UpstreamAuthToken, LocalAuthToken, CollectionTypes, ApiMessages } from "../../constants";
import { logger, previousVersionExists, versionsDiffer } from "../../utils";
import { runPagesSidebarBlocks } from './pagesSidebarBlocks';

export async function runPages(id) {
    try {
        var appliedChanges = [];
        const latest = await getPagesById(id, Endpoints.LOCAL, LocalAuthToken);
        const previous = await getPagesById(id, Endpoints.UPSTREAM, UpstreamAuthToken);

        // Extract hero_image — it must be set via REST, not GraphQL
        const heroImageId = latest.hero_image?.id || null;
        delete latest.hero_image;

        if (!previousVersionExists(previous)) {
            const newId = await createPagesItem(latest, Endpoints.UPSTREAM, UpstreamAuthToken);
            if (heroImageId) {
                await updatePageHeroImage(newId, heroImageId, Endpoints.UPSTREAM_CMS, UpstreamAuthToken);
            }
            appliedChanges.push({
                id: newId,
                collection: CollectionTypes.PAGES,
                message: ApiMessages.ITEM_CREATED
            });
        } else if (versionsDiffer(previous, latest)) {
            const updateId = await updatePagesItem(id, latest, Endpoints.UPSTREAM, UpstreamAuthToken);
            if (heroImageId) {
                await updatePageHeroImage(id, heroImageId, Endpoints.UPSTREAM_CMS, UpstreamAuthToken);
            }
            appliedChanges.push({
                id: updateId,
                collection: CollectionTypes.PAGES,
                message: ApiMessages.ITEM_UPDATED
            });
        }
        const pagesPageBlocksResults = await runPagesPageBlocks(id);
        if (pagesPageBlocksResults.length > 0) {
            appliedChanges.concat(pagesPageBlocksResults)
        }

        const pagesSidebarBlocksResults = await runPagesSidebarBlocks(id);
        return pagesSidebarBlocksResults.length > 0
            ? appliedChanges.concat(pagesSidebarBlocksResults)
            : appliedChanges;
    }
    catch (error) {
        logger.error(`Error in runPages (${id}):`, error)
        throw new Error('Error in runPages');
    }
}
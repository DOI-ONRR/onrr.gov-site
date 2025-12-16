import { getCollectionBlocksById, createCollectionBlocksItem, updateCollectionBlocksItem } from "../../operations/collectionBlocks";
import { Endpoints, UpstreamAuthToken, LocalAuthToken, ApiMessages, CollectionTypes } from "../../constants";
import { logger, previousVersionExists, versionsDiffer } from "../../utils";

export async function runCollectionBlocks(id) {
    try {
      const latest = await getCollectionBlocksById(id, Endpoints.LOCAL, LocalAuthToken);
      const previous = await getCollectionBlocksById(id, Endpoints.UPSTREAM, UpstreamAuthToken);
      if (!previousVersionExists(previous)) {
          const createdId = await createCollectionBlocksItem(latest, Endpoints.UPSTREAM, UpstreamAuthToken);
          return {
              id: createdId,
              collection: CollectionTypes.COLLECTION_BLOCKS,
              message: ApiMessages.ITEM_CREATED
          }
      } else if (versionsDiffer(previous, latest)) {
          const updatedItem = await updateCollectionBlocksItem(id, latest, Endpoints.UPSTREAM, UpstreamAuthToken);
          return {
              item: updatedItem,
              collection: CollectionTypes.COLLECTION_BLOCKS,
              message: ApiMessages.ITEM_UPDATED
          }
      }
      return null;
    }
    catch(error) {
        logger.error(`Error in runCollectionBlocks.run (${id}):`, error)
        throw new Error('Error in runCollectionBlocks.run');
    }
}
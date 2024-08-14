import { 
    pagesById, 
    createPagesItem,
    pagesByIdFull,
    pagesPageBlocks as getPagesPageBlocks,
    getPagesPageBlockItemByPageBlockId
} from '../operations/pages';
import { createItemByCollection } from '../operations/misc';
import { getContentBlocksById } from '../operations/contentBlocks';
import { getCardBlocksById } from '../operations/cardBlocks';
import { run as runCardBlocksFlow } from '../utils/cardBlocksFlowUtil';
import { run as runContentBlocksFlow } from '../utils/contentBlocksFlowUtil';
import { run as runExpansionPanelsFlow } from '../utils/expansionPanelsFlowUtil';
import { run as runTabBlocksFlow } from '../utils/tabBlocksFlowUtil';
import { CollectionTypes } from '../constants';
import diff from 'deep-diff';
import { logger } from './logger';

export default class PagesFlow {
    constructor(env, pages_id) {
        this.__env = env;
        this.__pages_id = pages_id;
        this.__upstreamUrl = env.DIRECTUS_EXTENSION_FLOWS_UPSTREAM_ENDPOINT;
        this.__originUrl = env.DIRECTUS_EXTENSION_FLOWS_LOCAL_ENDPOINT;
        this.__authToken = env.DIRECTUS_EXTENSION_FLOWS_AUTH_TOKEN;
        this.__originPage = {};
    }

    get pages_id() {
        return this._pages_id;
    }

    set pages_id(id) {
        if (!Number.isInteger(id)) {
            throw new Error('Invalid pages_id. It must be an integer.');
        }
        this._pages_id = id;
    }

    async #getPagesById(endpoint) {
        try {
            return await pagesById(this.__pages_id, endpoint);
        }
        catch(error) {
            logger.error("Error in getPagesById:", error);
        }
    }

    async #getDiff() {
        try {
            this.__originPage = await this.#getPagesById(this.__originUrl);
            const upstreamPage = await this.#getPagesById(this.__upstreamUrl);
            return diff(upstreamPage, this.__originPage);
        }
        catch(error) {
            logger.error("Error in getDiff", error);
            throw new Error('Error in getDiff');
        }
    }

    async #createCollectionItem(item) {
        try {
            var data = {};
            const pageBlockItem = await getPagesPageBlockItemByPageBlockId(item.id, this.__originUrl)
            switch (item.collection) {
                case CollectionTypes.CARD_BLOCKS:
                    await runCardBlocksFlow(pageBlockItem.id);
                    break;
                case CollectionTypes.CONTENT_BLOCKS:
                    await runContentBlocksFlow(pageBlockItem.id);
                    break;
                case CollectionTypes.TAB_BLOCKS:
                    await runTabBlocksFlow(pageBlockItem.id);
                    break;
                case CollectionTypes.EXPANSION_PANELS:
                    await runExpansionPanelsFlow(pageBlockItem.id);
                    break;
                default:
                    break;
            }
        }
        catch(error) {
            logger.error(`Error in createCollectionItem\n ${JSON.stringify(item, null, 2)}`, error);
            throw new Error('Something went wrong creating a new item.')
        }
    }

    async run() {
        try {
            const pageChanges = await this.#getDiff();
            if (pageChanges.length == 0) {
                return {
                    message: 'Upstream matches origin'
                }
            }
            const firstChange = pageChanges[0];
            if (firstChange.kind == 'E' && !firstChange.lhs) {
                // see image-uploader code for uploading hero image upstream
                const pagesId = -1; //await createPagesItem(this.__originPage, this.__upstreamUrl, this.__authToken);
                const latestPagesPageBlocks = await getPagesPageBlocks(this.__pages_id, this.__originUrl);
                const previousPagesPageBlocks = await getPagesPageBlocks(this.__pages_id, this.__upstreamUrl);
                const pageBlockChanges = await diff(previousPagesPageBlocks, latestPagesPageBlocks);
                logger.info(JSON.stringify(pageBlockChanges, null, 2));
                for (let change of pageBlockChanges) {
                    switch (change.item.kind) {
                        case 'N': // New
                            this.#createCollectionItem(change.item.rhs);
                            break;
                        default:
                            break;
                    }
                }
                return {
                    message: `New pages_id: ${pagesId}`
                }
            }
            return {
                message: 'Upstream differs from origin'
            }
        }
        catch(error) {
            logger.error('Error in run', error);
            throw new Error('Error in run');
        }
    }
}
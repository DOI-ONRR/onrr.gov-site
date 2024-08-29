import { 
    pagesById, 
    createPagesItem,
    getPagesByIdDeep,
    pagesPageBlocks as getPagesPageBlocks,
    getPagesPageBlockItemByPageBlockId,
    createPagesPageBlocksItems,
    updatePagesItem
} from '../../operations/pages';
import { runCardBlocks } from '../cardBlocksFlow/cardBlocks';
import { runContentBlocks } from '../contentBlocksFlow';
import { runExpansionPanels } from '../expansionPanelsFlow/expansionPanels';

import { runTabBlocks, runTabBlocksTabBlocks, runTabBlockLabel } from '../tabBlocksFlow';
import { CollectionTypes, PathArrayTypes } from '../../constants';
import diff from 'deep-diff';
import { logger } from '../../utils/logger';

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
            const previous = await this.#getPagesById(this.__upstreamUrl);
            return diff(previous, this.__originPage);
        }
        catch(error) {
            logger.error("Error in getDiff", error);
            throw new Error('Error in getDiff');
        }
    }

    async #createCollectionItem(item) {
        try {
            const pageBlockItem = await getPagesPageBlockItemByPageBlockId(item.id, this.__originUrl)
            switch (item.collection) {
                case CollectionTypes.CARD_BLOCKS:
                    return await runCardBlocksFlow(pageBlockItem.id);
                case CollectionTypes.CONTENT_BLOCKS:
                    return await runContentBlocksFlow(pageBlockItem.id);
                case CollectionTypes.TAB_BLOCKS:
                    return await runTabBlocksFlow(pageBlockItem.id);
                case CollectionTypes.EXPANSION_PANELS:
                    return await runExpansionPanelsFlow(pageBlockItem.id);
            }
        }
        catch(error) {
            logger.error(`Error in createCollectionItem\n ${JSON.stringify(item, null, 2)}`, error);
            throw new Error('Something went wrong creating a new item.')
        }
    }

    #prefilterBlocks(path, key) {
        return path.some(segment => segment === 'blocks');
    }

    async #deepChangeEdit(change, latest) {
        var processedChange = {};
        const itemPath = this.#getPathOfNextToLast(change.path);
        const item = itemPath.reduce((acc, key) => acc && acc[key], latest);
        if (change.path[change.path.length - 1] === 'item') {
            switch (item.collection) {
                case CollectionTypes.CARD_BLOCKS:
                    processedChange = await runCardBlocksFlow(item.id);
                    break;
                case CollectionTypes.CONTENT_BLOCKS:
                    processedChange = await runContentBlocksFlow(item.id);
                    break;
                case CollectionTypes.TAB_BLOCKS:
                    processedChange = await runTabBlocks(item.id);
                    break;
                case CollectionTypes.EXPANSION_PANELS:
                    processedChange = await runExpansionPanelsFlow(item.id);
                    break;
                case CollectionTypes.TAB_BLOCK_LABEL:
                    processedChange = await runTabBlockLabel(item.id);
                    break;
            }
        }
        else if ('tab_blocks_id' in item) {
            processedChange = await runTabBlocksTabBlocks(item.id);
        }
        return processedChange;
    }

    async #deepChangeArray(change) {
        const arrayType = change.path.at(-1);
        switch (arrayType) {
            case PathArrayTypes.TAB_BLOCKS:
                if (change.item.kind === 'N') {
                    if (change.item.rhs.item.collection === CollectionTypes.CONTENT_BLOCKS) {
                        let contentBlockChange = await runContentBlocksFlow(change.item.rhs.item.id);
                        let tabBlocksTabBlocksChange = await runTabBlocksTabBlocks(change.item.rhs.id);
                        return [contentBlockChange, tabBlocksTabBlocksChange];
                    }
                    if (change.item.rhs.collection === CollectionTypes.TAB_BLOCK_LABEL) {
                        let tabBlockLabelChange = await runTabBlockLabel(change.item.rhs.item.id);
                        let tabBlocksTabBlocksChange = await runTabBlocksTabBlocks(change.item.rhs.id);
                        return [tabBlockLabelChange, tabBlocksTabBlocksChange];
                    }
                }
                break;
        }
    }

    async #processDeepChanges() {
        try {
            var processedChanges = [];
            var processedChange = null;
            const latest = await getPagesByIdDeep(this.__pages_id, this.__originUrl);
            const previous = await getPagesByIdDeep(this.__pages_id, this.__upstreamUrl);
            const deepChanges = diff(previous, latest, this.#prefilterBlocks);
            // logger.info('latest page:\n', latest);
            logger.info('deepChanges: \n', deepChanges);
            return;
            if (!deepChanges) {
                return;
            }
            for (let change of deepChanges) {
                switch (change.kind) {
                    case 'E':
                        processedChanges.push(await this.#deepChangeEdit(change, latest));
                        break;
                    case 'A':
                        processedChange = await this.#deepChangeArray(change, latest);
                        if (Array.isArray(processedChange)) {
                            processedChanges.push(...processedChange);
                        }
                        else {
                            processedChanges.push(processedChange);
                        }
                        break;
                }
            }
            logger.info('processed changes: ', processedChanges);
            return processedChanges;
        } catch (error) {
            logger.error('Error in processDeepChanges', error);
            throw new Error('Error in processDeepChanges')
        }
    }

    #getPathOfNextToLast(path) {
        return path.slice(0, path.length - 1);
    }

    async run() {
        try {
            const pageChanges = await this.#getDiff();
            if (pageChanges) {
                const firstChange = pageChanges[0];
                if (pageChanges.length === 1 && firstChange.kind == 'E' && !firstChange.lhs) {
                    // see image-uploader code for uploading hero image upstream
                    const pagesId = await createPagesItem(this.__originPage, this.__upstreamUrl, this.__authToken);
                    const latestPagesPageBlocks = await getPagesPageBlocks(this.__pages_id, this.__originUrl);
                    const previousPagesPageBlocks = await getPagesPageBlocks(this.__pages_id, this.__upstreamUrl);
                    const pageBlockChanges = diff(previousPagesPageBlocks, latestPagesPageBlocks);
                    let pageBlocksItems = [];
                    for (let change of pageBlockChanges) {
                        switch (change.item.kind) {
                            case 'N': // New
                                let response = await this.#createCollectionItem(change.item.rhs);
                                logger.info('create response:', response)
                                pageBlocksItems.push({
                                    id: change.item.rhs.id,
                                    pages_id: {
                                        id: pagesId
                                    },
                                    collection: response.collection,
                                    item: response.id,
                                    sort: change.item.rhs.sort
                                });
                                break;
                            default:
                                break;
                        }
                    }
                    await createPagesPageBlocksItems(pageBlocksItems, this.__upstreamUrl, this.__authToken);
                    return {
                        message: `New page and embedded collection items have been successfully created at endpoint ${this.__upstreamUrl}`
                    }
                }
                let updatedPage = {};
                for (let change of pageChanges) {
                    updatedPage[change.path[0]] = change.lhs;
                }
                await updatePagesItem(this.__pages_id, updatedPage, this.__upstreamUrl, this.__authToken);
                const deepChanges = await this.#processDeepChanges();
                return {
                    message: `Page ${this.__pages_id} was successfully updated.`,
                    pageUpdates: updatedPage,
                    deepChanges: !deepChanges ? [] : deepChanges
                }
            }
            const deepChanges = await this.#processDeepChanges();
            return {
                message: !deepChanges ? 'There were no changes detected within the page.' : 'Deep changes detected.',
                deepChanges: !deepChanges ? [] : deepChanges
            }
        }
        catch(error) {
            logger.error('Error in run', error);
            throw new Error('Error in run');
        }
    }
}
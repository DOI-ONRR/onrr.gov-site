import { jest } from '@jest/globals';

jest.unstable_mockModule('../../../src/operations/pages/getPagesPageBlocks', () => ({
    getPagesPageBlocks: jest.fn()
}));

jest.unstable_mockModule('../../../src/operations/pages/createPagesPageBlocksItem', () => ({
    createPagesPageBlocksItem: jest.fn()
}));

jest.unstable_mockModule('../../../src/operations/pages/deletePagesPageBlocksItem', () => ({
    deletePagesPageBlocksItem: jest.fn()
}));

jest.unstable_mockModule('../../../src/operations/pages/updatePagesPageBlocksItem', () => ({
    updatePagesPageBlocksItem: jest.fn()
}));

jest.unstable_mockModule('../../../src/services/cardBlocksFlow/cardBlocks', () => ({
    runCardBlocks: jest.fn()
}));

jest.unstable_mockModule('../../../src/services/contentBlocksFlow/contentBlocks', () => ({
    runContentBlocks: jest.fn()
}));

jest.unstable_mockModule('../../../src/services/expansionPanelsFlow/expansionPanels', () => ({
    runExpansionPanels: jest.fn()
}));

jest.unstable_mockModule('../../../src/services/tabBlocksFlow/tabBlocks', () => ({
    runTabBlocks: jest.fn()
}));

jest.unstable_mockModule('../../../src/services/collectionBlocksFlow/collectionBlocks', () => ({
    runCollectionBlocks: jest.fn()
}));

import { pageId, pagesPageBlocks } from '../../__mocks__/pages/pagesPageBlocks.mocks';
import { ApiMessages, CollectionTypes } from '../../../src/constants';

export const getMocks = async () => {
    const { getPagesPageBlocks } = await import('../../../src/operations/pages/getPagesPageBlocks');
    const { createPagesPageBlocksItem } = await import('../../../src/operations/pages/createPagesPageBlocksItem');
    const { deletePagesPageBlocksItem } = await import('../../../src/operations/pages/deletePagesPageBlocksItem');
    const { updatePagesPageBlocksItem } = await import('../../../src/operations/pages/updatePagesPageBlocksItem');
    const { runCardBlocks } = await import('../../../src/services/cardBlocksFlow/cardBlocks');
    const { runContentBlocks } = await import('../../../src/services/contentBlocksFlow/contentBlocks');
    const { runExpansionPanels } = await import('../../../src/services/expansionPanelsFlow/expansionPanels');
    const { runTabBlocks } = await import('../../../src/services/tabBlocksFlow/tabBlocks');
    const { runCollectionBlocks } = await import('../../../src/services/collectionBlocksFlow/collectionBlocks');

    return {
        getPagesPageBlocks,
        createPagesPageBlocksItem,
        deletePagesPageBlocksItem,
        updatePagesPageBlocksItem,
        runCardBlocks,
        runContentBlocks,
        runExpansionPanels,
        runTabBlocks,
        runCollectionBlocks,
        pageId,
        pagesPageBlocks
    };
};
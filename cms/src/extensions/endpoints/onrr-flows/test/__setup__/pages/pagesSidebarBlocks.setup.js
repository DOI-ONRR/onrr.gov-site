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

import { pageId, pagesPageBlocks } from '../../__mocks__/pages/pagesPageBlocks.mocks';
import { ApiMessages, CollectionTypes } from '../../../src/constants';

export const getMocks = async () => {
    const { getPagesSidebarBlocks } = await import('../../../src/operations/pages/getPagesSidebarBLocks');
    const { createPagesSidebarBlocksItem } = await import('../../../src/operations/pages/createPagesSidebarBlocksItem');
    const { deletePagesSidebarBlocksItem } = await import('../../../src/operations/pages/deletePagesSidebarBlocksItem');
    const { updatePagesSidebarBlocksItem } = await import('../../../src/operations/pages/updatePagesSidebarBlocksItem');
    const { runCardBlocks } = await import('../../../src/services/cardBlocksFlow/cardBlocks');
    const { runContentBlocks } = await import('../../../src/services/contentBlocksFlow/contentBlocks');
    const { runExpansionPanels } = await import('../../../src/services/expansionPanelsFlow/expansionPanels');
    const { runTabBlocks } = await import('../../../src/services/tabBlocksFlow/tabBlocks');

    return {
        getPagesSidebarBlocks,
        createPagesSidebarBlocksItem,
        deletePagesSidebarBlocksItem,
        updatePagesSidebarBlocksItem,
        runCardBlocks,
        runContentBlocks,
        runExpansionPanels,
        runTabBlocks,
        pageId,
        pagesPageBlocks
    };
};
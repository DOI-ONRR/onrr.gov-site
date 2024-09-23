import { jest } from '@jest/globals';

jest.unstable_mockModule('../../../src/operations/pages/getPagesById', () => ({
    getPagesById: jest.fn()
}));

jest.unstable_mockModule('../../../src/operations/pages/createPagesItem', () => ({
    createPagesItem: jest.fn()
}));

jest.unstable_mockModule('../../../src/operations/pages/updatePagesItem', () => ({
    updatePagesItem: jest.fn()
}));

jest.unstable_mockModule('../../../src/services/pagesFlow/pagesPageBlocks', () => ({
    runPagesPageBlocks: jest.fn()
}));

import { pageId, pagesById, createPage, runPagesPageBlocksResults } from '../../__mocks__/pages/pages.mocks';

export const getMocks = async () => {
    const { getPagesById } = await import('../../../src/operations/pages/getPagesById');
    const { createPagesItem } = await import('../../../src/operations/pages/createPagesItem');
    const { updatePagesItem } = await import('../../../src/operations/pages/updatePagesItem');
    const { runPagesPageBlocks } = await import('../../../src/services/pagesFlow/pagesPageBlocks')

    return {
        getPagesById,
        createPagesItem,
        updatePagesItem,
        runPagesPageBlocks,
        pageId,
        pagesById,
        createPage,
        runPagesPageBlocksResults
    };
};
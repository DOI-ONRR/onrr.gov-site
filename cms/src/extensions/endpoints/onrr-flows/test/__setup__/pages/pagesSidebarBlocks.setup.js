import { jest } from '@jest/globals';

jest.unstable_mockModule('../../../src/operations/pages/getPagesSidebarBlocks', () => ({
    getPagesSidebarBlocks: jest.fn()
}));

jest.unstable_mockModule('../../../src/operations/pages/createPagesSidebarBlocksItem', () => ({
    createPagesSidebarBlocksItem: jest.fn()
}));

jest.unstable_mockModule('../../../src/operations/pages/deletePagesSidebarBlocksItem', () => ({
    deletePagesSidebarBlocksItem: jest.fn()
}));

jest.unstable_mockModule('../../../src/operations/pages/updatePagesSidebarBlocksItem', () => ({
    updatePagesSidebarBlocksItem: jest.fn()
}));

jest.unstable_mockModule('../../../src/services/contentBlocksFlow/contentBlocks', () => ({
    runContentBlocks: jest.fn()
}));

jest.unstable_mockModule('../../../src/services/collectionBlocksFlow/collectionBlocks', () => ({
    runCollectionBlocks: jest.fn()
}));

import { pageId, pagesSidebarBlocks } from '../../__mocks__/pages/pagesSidebarBlocks.mocks';
import { ApiMessages, CollectionTypes } from '../../../src/constants';

export const getMocks = async () => {
    const { getPagesSidebarBlocks } = await import('../../../src/operations/pages/getPagesSidebarBlocks');
    const { createPagesSidebarBlocksItem } = await import('../../../src/operations/pages/createPagesSidebarBlocksItem');
    const { deletePagesSidebarBlocksItem } = await import('../../../src/operations/pages/deletePagesSidebarBlocksItem');
    const { updatePagesSidebarBlocksItem } = await import('../../../src/operations/pages/updatePagesSidebarBlocksItem');
    const { runContentBlocks } = await import('../../../src/services/contentBlocksFlow/contentBlocks');
    const { runCollectionBlocks } = await import('../../../src/services/collectionBlocksFlow/collectionBlocks');

    return {
        getPagesSidebarBlocks,
        createPagesSidebarBlocksItem,
        deletePagesSidebarBlocksItem,
        updatePagesSidebarBlocksItem,
        runContentBlocks,
        runCollectionBlocks,
        pageId,
        pagesSidebarBlocks
    };
};
import { jest } from '@jest/globals';

jest.unstable_mockModule('../../../src/operations/collectionBlocks/getCollectionBlocksById', () => ({
    getCollectionBlocksById: jest.fn()
}));

jest.unstable_mockModule('../../../src/operations/collectionBlocks/createCollectionBlocksItem', () => ({
    createCollectionBlocksItem: jest.fn()
}));

jest.unstable_mockModule('../../../src/operations/collectionBlocks/updateCollectionBlocksItem', () => ({
    updateCollectionBlocksItem: jest.fn()
}));

import { id, item } from '../../__mocks__/collectionBlocks/collectionBlocks.mocks';

export const getMocks = async () => {
    const { getCollectionBlocksById } = await import('../../../src/operations/collectionBlocks/getCollectionBlocksById');
    const { createCollectionBlocksItem } = await import('../../../src/operations/collectionBlocks/createCollectionBlocksItem');
    const { updateCollectionBlocksItem } = await import('../../../src/operations/collectionBlocks/updateCollectionBlocksItem');

    return {
        getCollectionBlocksById,
        createCollectionBlocksItem,
        updateCollectionBlocksItem,
        id,
        item
    };
};
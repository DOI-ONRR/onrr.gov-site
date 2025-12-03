import { jest } from '@jest/globals';
import { cardBlocksCardContentBlocks } from '../../__mocks__/cardBlocks/cardBlocksCardContentBlocks.mocks';

jest.unstable_mockModule('../../../src/operations/cardBlocks/getCardBlocksCardContentBlocks', () => ({
    getCardBlocksCardContentBlocks: jest.fn()
}));

jest.unstable_mockModule('../../../src/operations/cardBlocks/createCardBlocksCardContentBlocksItem', () => ({
    createCardBlocksCardContentBlocksItem: jest.fn()
}));

jest.unstable_mockModule('../../../src/operations/cardBlocks/deleteCardBlocksCardContentBlocksItem', () => ({
    deleteCardBlocksCardContentBlocksItem: jest.fn()
}));

jest.unstable_mockModule('../../../src/operations/cardBlocks/updateCardBlocksCardContentBlocksItem', () => ({
    updateCardBlocksCardContentBlocksItem: jest.fn()
}));

jest.unstable_mockModule('../../../src/services/contentBlocksFlow/contentBlocks', () => ({
    runContentBlocks: jest.fn()
}));

jest.unstable_mockModule('../../../src/services/collectionBlocksFlow/collectionBlocks', () => ({
    runCollectionBlocks: jest.fn()
}));

export const getMocks = async () => { 
    const { getCardBlocksCardContentBlocks } = await import('../../../src/operations/cardBlocks/getCardBlocksCardContentBlocks');
    const { createCardBlocksCardContentBlocksItem } = await import('../../../src/operations/cardBlocks/createCardBlocksCardContentBlocksItem');
    const { deleteCardBlocksCardContentBlocksItem } = await import('../../../src/operations/cardBlocks/deleteCardBlocksCardContentBlocksItem');
    const { updateCardBlocksCardContentBlocksItem } = await import('../../../src/operations/cardBlocks/updateCardBlocksCardContentBlocksItem');
    const { runContentBlocks } = await import('../../../src/services/contentBlocksFlow/contentBlocks');
    const { runCollectionBlocks } = await import('../../../src/services/collectionBlocksFlow/collectionBlocks');

    return {
        getCardBlocksCardContentBlocks,
        createCardBlocksCardContentBlocksItem,
        deleteCardBlocksCardContentBlocksItem,
        updateCardBlocksCardContentBlocksItem,
        runContentBlocks,
        runCollectionBlocks,
        cardBlocksCardContentBlocks
    }
}
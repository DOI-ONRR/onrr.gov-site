import { jest } from '@jest/globals';
import { getMocks } from '../../__setup__/cardBlocks/cardBlocksCardContentBlocks.setup';
import { ApiMessages, CollectionTypes } from '../../../src/constants';

const { runCardBlocksCardContentBlocks: sut} = await import('../../../src/services/cardBlocksFlow/cardBlocksCardContentBlocks');

let getCardBlocksCardContentBlocks,
    createCardBlocksCardContentBlocksItem,
    deleteCardBlocksCardContentBlocksItem,
    updateCardBlocksCardContentBlocksItem,
    runContentBlocks,
    cardBlocksCardContentBlocks;

beforeAll(async () => {
    const mocks = await getMocks();
    getCardBlocksCardContentBlocks = mocks.getCardBlocksCardContentBlocks;
    createCardBlocksCardContentBlocksItem = mocks.createCardBlocksCardContentBlocksItem;
    deleteCardBlocksCardContentBlocksItem = mocks.deleteCardBlocksCardContentBlocksItem;
    updateCardBlocksCardContentBlocksItem = mocks.updateCardBlocksCardContentBlocksItem;
    runContentBlocks = mocks.runContentBlocks;
    cardBlocksCardContentBlocks = mocks.cardBlocksCardContentBlocks;
});

describe('Card content block tests', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    test('Returns an array', async () => {
        // Arrange
        getCardBlocksCardContentBlocks.mockResolvedValue(cardBlocksCardContentBlocks);

        // Act
        const result = await sut();

        // Assert
        expect(Array.isArray(result)).toBeTruthy();
    });

    test('Calls getCardBlocksCardContentBlocks twice', async () => {
        // Arrange
        getCardBlocksCardContentBlocks.mockResolvedValue(cardBlocksCardContentBlocks);
        
        // Act
        await sut();
        
        // Assert
        expect(getCardBlocksCardContentBlocks).toHaveBeenCalledTimes(2);
    });

    test('Calls createCardBlocksCardContentBlock', async () => {
        // Arrange
        getCardBlocksCardContentBlocks.mockResolvedValueOnce(cardBlocksCardContentBlocks)
            .mockResolvedValueOnce([]);
        
        // Act
        await sut();
        
        // Assert
        expect(createCardBlocksCardContentBlocksItem).toHaveBeenCalledTimes(3);
    });

    test('Adding new block returns ITEM_CREATED in results', async () => {
        // Arrange
        getCardBlocksCardContentBlocks.mockResolvedValueOnce(cardBlocksCardContentBlocks)
            .mockResolvedValueOnce([]);
        
        // Act
        const results = await sut();
        
        // Assert
        expect(results.find(r => r.message === ApiMessages.ITEM_CREATED)).toBeTruthy();
    });

    test('Calls deleteCardBlocksCardContentBlocksItem', async () => {
        // Arrange
        getCardBlocksCardContentBlocks.mockResolvedValueOnce([])
            .mockResolvedValueOnce(cardBlocksCardContentBlocks);
        
        // Act
        await sut();

        // Assert
        expect(deleteCardBlocksCardContentBlocksItem).toHaveBeenCalled()
    });

    test('Removing card content block returns ITEM_DELETED', async () => {
        // Arrange
        getCardBlocksCardContentBlocks.mockResolvedValueOnce([])
            .mockResolvedValueOnce(cardBlocksCardContentBlocks);
        
        // Act
        const results = await sut();

        // Assert
        expect(results.find(r => r.message === ApiMessages.ITEM_DELETED)).toBeTruthy();
    });

    test('Calls runContentBlocks', async () => {
        // Arrange
        getCardBlocksCardContentBlocks.mockResolvedValueOnce(cardBlocksCardContentBlocks)
            .mockResolvedValueOnce([]);

        // Act
        await sut();

        // Assert
        expect(runContentBlocks).toHaveBeenCalled();
    });

    test('Calls updateCardBlocksCardContentBlocksItem', async () => {
        // Arrange
        var previous = JSON.parse(JSON.stringify(cardBlocksCardContentBlocks));
        previous[0].Sort = 1;
        previous[1].Sort = 0;
        getCardBlocksCardContentBlocks.mockResolvedValueOnce(cardBlocksCardContentBlocks)
            .mockResolvedValueOnce(previous);

        // Act
        await sut();

        // Assert
        expect(updateCardBlocksCardContentBlocksItem).toHaveBeenCalled();
    });

    test('Updating order includes ITEM_UPDATED', async () => {
        // Arrange
        var previous = JSON.parse(JSON.stringify(cardBlocksCardContentBlocks));
        previous[0].Sort = 1;
        previous[1].Sort = 0;
        getCardBlocksCardContentBlocks.mockResolvedValueOnce(cardBlocksCardContentBlocks)
            .mockResolvedValueOnce(previous);

        // Act
        const results = await sut();

        // Assert
        expect(results.find(r => r.message === ApiMessages.ITEM_UPDATED && r.collection === CollectionTypes.CARD_BLOCKS_CARD_CONTENT_BLOCKS)).toBeTruthy();
    });
});
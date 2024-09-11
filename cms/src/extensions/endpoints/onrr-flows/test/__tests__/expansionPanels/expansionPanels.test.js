import { jest } from '@jest/globals'
import { getMocks } from '../../__setup__/expansionPanels/expansionPanels.setup';
import { ApiMessages, CollectionTypes } from '../../../src/constants';
const { runExpansionPanels: sut } = await import('../../../src/services/expansionPanelsFlow/expansionPanels');

let getExpansionPanelsById,
    createExpansionPanelsItem,
    updateExpansionPanelsItem,
    runExpansionPanelsExpansionPanelBlocks,
    expansionPanelId,
    expansionPanelsByIdLatest;

beforeAll(async () => {
    const mocks = await getMocks();
    getExpansionPanelsById = mocks.getExpansionPanelsById;
    createExpansionPanelsItem = mocks.createExpansionPanelsItem;
    updateExpansionPanelsItem = mocks.updateExpansionPanelsItem;
    runExpansionPanelsExpansionPanelBlocks = mocks.runExpansionPanelsExpansionPanelBlocks;
    expansionPanelId = mocks.expansionPanelId;
    expansionPanelsByIdLatest = mocks.expansionPanelsByIdLatest;
});

describe('Expansion panels flow', () => {
    beforeEach(async() => {
        jest.resetAllMocks();
        runExpansionPanelsExpansionPanelBlocks.mockResolvedValue([]);
    });

    test('Value of result should be an array', async () => {
        // Act
        const result = await sut(expansionPanelId);
        
        // Assert
        expect(Array.isArray(result)).toBeTruthy();
    });

    test('getExpansionPanelsById is called 2x', async () => {
        // Arrange
        getExpansionPanelsById.mockResolvedValue(expansionPanelsByIdLatest);

        // Act
        await sut(expansionPanelId)

        // Assert
        expect(getExpansionPanelsById).toHaveBeenCalledTimes(2);
    });

    test('Creating new expansion panel should call createExpansionPanelsItem', async () => {
        // Arrange
        getExpansionPanelsById.mockResolvedValueOnce(expansionPanelsByIdLatest)
            .mockResolvedValueOnce(null);

        // Act
        await sut(expansionPanelId);

        // Assert
        expect(createExpansionPanelsItem).toHaveBeenCalled();
    });

    test('Result when creating new expansion panel should include ITEM_CREATED', async () => {
        // Arrange
        getExpansionPanelsById.mockResolvedValueOnce(expansionPanelsByIdLatest)
            .mockResolvedValueOnce(null);

        // Act
        const result = await sut(expansionPanelId);

        // Assert
        expect(result.find(c => c.collection === CollectionTypes.EXPANSION_PANELS && c.message === ApiMessages.ITEM_CREATED)).toBeTruthy();
    });

    test('Change to existing expansion panel should call updateExpansionPanelsItem', async () => {
        // Arrange
        var previous = JSON.parse(JSON.stringify(expansionPanelsByIdLatest));
        previous.status = 'Draft';
        getExpansionPanelsById.mockResolvedValueOnce(expansionPanelsByIdLatest)
            .mockResolvedValueOnce(previous);

        // Act
        await sut(expansionPanelId);

        // Assert
        expect(updateExpansionPanelsItem).toHaveBeenCalled();
    });

    test('Result updating existing expansion panel should include ITEM_UPDATED', async () => {
        // Arrange
        var previous = JSON.parse(JSON.stringify(expansionPanelsByIdLatest));
        previous.status = 'Draft';
        getExpansionPanelsById.mockResolvedValueOnce(expansionPanelsByIdLatest)
            .mockResolvedValueOnce(previous);

        // Act
        const result = await sut(expansionPanelId);

        // Assert
        expect(result.find(c => c.collection === CollectionTypes.EXPANSION_PANELS && c.message === ApiMessages.ITEM_UPDATED)).toBeTruthy();
    });

    test('runExpansionPanelsExpansionPanelBlocks is called', async () => {
        // Arrange
        getExpansionPanelsById.mockResolvedValue(expansionPanelsByIdLatest);

        // Act
        await sut(expansionPanelId)

        // Assert
        expect(runExpansionPanelsExpansionPanelBlocks).toHaveBeenCalled();
    })
});
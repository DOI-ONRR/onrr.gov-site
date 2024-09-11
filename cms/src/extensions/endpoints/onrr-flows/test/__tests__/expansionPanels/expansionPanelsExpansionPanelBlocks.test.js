import { jest } from '@jest/globals'
import { getMocks } from '../../__setup__/expansionPanels/expansionPanelsExpansionPanelBlocks.setup';
import { ApiMessages, CollectionTypes } from '../../../src/constants';
const { runExpansionPanelsExpansionPanelBlocks: sut } = await import('../../../src/services/expansionPanelsFlow/expansionPanelsExpansionPanelBlocks');

let getExpansionPanelsExpansionPanelBlocks,
    createExpansionPanelsExpansionPanelBlocksItem,
    deleteExpansionPanelsExpansionPanelBlocksItem,
    updateExpansionPanelsExpansionPanelBlocksItem,
    runCardBlocks,
    runContentBlocks,
    runExpansionPanelBlockLabel,
    expansionPanelId,
    expansionPanelsExpansionPanelBlocks,
    expansionPanelsExpansionPanelBlocksPrevious;

beforeAll(async () => {
    const mocks = await getMocks();
    getExpansionPanelsExpansionPanelBlocks = mocks.getExpansionPanelsExpansionPanelBlocks;
    createExpansionPanelsExpansionPanelBlocksItem = mocks.createExpansionPanelsExpansionPanelBlocksItem;
    deleteExpansionPanelsExpansionPanelBlocksItem = mocks.deleteExpansionPanelsExpansionPanelBlocksItem;
    updateExpansionPanelsExpansionPanelBlocksItem = mocks.updateExpansionPanelsExpansionPanelBlocksItem;
    expansionPanelId = mocks.expansionPanelId;
    expansionPanelsExpansionPanelBlocks = mocks.expansionPanelsExpansionPanelBlocks;
    expansionPanelsExpansionPanelBlocksPrevious = mocks.expansionPanelsExpansionPanelBlocksPrevious;
    runCardBlocks = mocks.runCardBlocks;
    runContentBlocks = mocks.runContentBlocks;
    runExpansionPanelBlockLabel = mocks.runExpansionPanelBlockLabel;
});

describe('Expansion panels expansion panel blocks flow', () => {
    beforeEach(async() => {
        jest.resetAllMocks();
    });

    test('getExpansionPanelsExpansionPanelBlocks is called 2x', async () => {
        // Arrange
        getExpansionPanelsExpansionPanelBlocks.mockResolvedValue([]);

        // Act
        await sut(expansionPanelId)

        // Assert
        expect(getExpansionPanelsExpansionPanelBlocks).toHaveBeenCalledTimes(2);
    });

    test('Creation of new expansion panel block should call createExpansionPanelsExpansionPanelBlocksItem', async () => {
        // Arrange
        getExpansionPanelsExpansionPanelBlocks
            .mockResolvedValueOnce(expansionPanelsExpansionPanelBlocks.slice(0, 1))
            .mockResolvedValueOnce([]);

        // Act
        await sut(expansionPanelId);

        // Assert
        expect(createExpansionPanelsExpansionPanelBlocksItem).toHaveBeenCalled();
    });

    test('Results of creation of new expansion panel block should call include ITEM_CREATED', async () => {
        // Arrange
        getExpansionPanelsExpansionPanelBlocks
            .mockResolvedValueOnce(expansionPanelsExpansionPanelBlocks.slice(0, 1))
            .mockResolvedValueOnce([]);

        // Act
        const results = await sut(expansionPanelId);

        // Assert
        expect(results.find(change => change.collection === CollectionTypes.EXPANSION_PANELS_EXPANSION_PANEL_BLOCKS && change.message === ApiMessages.ITEM_CREATED)).toBeTruthy();
    });

    test('Creation of new expansion panel block at beginning should call createExpansionPanelsExpansionPanelBlocksItem and updateExpansionPanelsExpansionPanelBlocksItem', async () => {
        // Arrange
        var latest = expansionPanelsExpansionPanelBlocks.slice(0, 1).concat(JSON.parse(JSON.stringify(expansionPanelsExpansionPanelBlocksPrevious)));
        latest[0].id = 1016;
        latest[1].sort = 2;
        latest[2].sort = 3;
        getExpansionPanelsExpansionPanelBlocks
            .mockResolvedValueOnce(latest)
            .mockResolvedValueOnce(expansionPanelsExpansionPanelBlocksPrevious);

        // Act
        await sut(expansionPanelId);

        // Assert
        expect(createExpansionPanelsExpansionPanelBlocksItem).toHaveBeenCalled();
        expect(updateExpansionPanelsExpansionPanelBlocksItem).toHaveBeenCalled();
    });

    test('Removal of expansion panel block should not call createExpansionPanelsExpansionPanelBlocksItem', async () => {
        // Arrange
        getExpansionPanelsExpansionPanelBlocks
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce(expansionPanelsExpansionPanelBlocks.slice(0, 1));

        // Act
        await sut(expansionPanelId);

        // Assert
        expect(createExpansionPanelsExpansionPanelBlocksItem).toHaveBeenCalledTimes(0);
    });

    test('Results of removal of expansion panel block should include ITEM_DELETED', async () => {
        // Arrange
        getExpansionPanelsExpansionPanelBlocks
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce(expansionPanelsExpansionPanelBlocks.slice(0, 1));

        // Act
        const results = await sut(expansionPanelId);

        // Assert
        expect(results.find(change => change.collection === CollectionTypes.EXPANSION_PANELS_EXPANSION_PANEL_BLOCKS && change.message === ApiMessages.ITEM_DELETED)).toBeTruthy();
    });

    test('Removal of expansion panel block should call deleteExpansionPanelsExpansionPanelBlocksItem', async () => {
        // Arrange
        getExpansionPanelsExpansionPanelBlocks
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce(expansionPanelsExpansionPanelBlocks.slice(0, 1));

        // Act
        await sut(expansionPanelId);

        // Assert
        expect(deleteExpansionPanelsExpansionPanelBlocksItem).toHaveBeenCalled();
    });

    test('Reorder of expansion panel blocks should call updateExpansionPanelsExpansionPanelBlocksItem', async () => {
        // Arrange
        var latestBlocks = JSON.parse(JSON.stringify(expansionPanelsExpansionPanelBlocks));
        latestBlocks[0].sort = 2;
        latestBlocks[1].sort = 1;
        getExpansionPanelsExpansionPanelBlocks.mockResolvedValueOnce(latestBlocks)
            .mockResolvedValueOnce(expansionPanelsExpansionPanelBlocks);

        // Act
        await sut(expansionPanelId);

        // Assert
        expect(updateExpansionPanelsExpansionPanelBlocksItem).toHaveBeenCalled();
    });

    test('Results of reorder of expansion panel blocks should include ITEM_UPDATED', async () => {
        // Arrange
        var latestBlocks = JSON.parse(JSON.stringify(expansionPanelsExpansionPanelBlocks));
        latestBlocks[0].sort = 2;
        latestBlocks[1].sort = 1;
        getExpansionPanelsExpansionPanelBlocks.mockResolvedValueOnce(latestBlocks)
            .mockResolvedValueOnce(expansionPanelsExpansionPanelBlocks);

        // Act
        const results = await sut(expansionPanelId);

        // Assert
        expect(results.find(change => change.collection === CollectionTypes.EXPANSION_PANELS_EXPANSION_PANEL_BLOCKS && change.message === ApiMessages.ITEM_UPDATED)).toBeTruthy();
    });

    test('runCardBlocks should be called', async () => {
        // Arrange
        getExpansionPanelsExpansionPanelBlocks.mockResolvedValue(expansionPanelsExpansionPanelBlocks);

        // Act
        await sut(expansionPanelId);

        // Assert
        expect(runCardBlocks).toHaveBeenCalled();
    });

    test('runContentBlocks should be called', async () => {
        // Arrange
        getExpansionPanelsExpansionPanelBlocks.mockResolvedValue(expansionPanelsExpansionPanelBlocks);

        // Act
        await sut(expansionPanelId);

        // Assert
        expect(runContentBlocks).toHaveBeenCalled();
    });

    test('runExpansionPanelBlockLabel should be called', async () => {
        // Arrange
        getExpansionPanelsExpansionPanelBlocks.mockResolvedValue(expansionPanelsExpansionPanelBlocks);

        // Act
        await sut(expansionPanelId);

        // Assert
        expect(runExpansionPanelBlockLabel).toHaveBeenCalled();
    });
});
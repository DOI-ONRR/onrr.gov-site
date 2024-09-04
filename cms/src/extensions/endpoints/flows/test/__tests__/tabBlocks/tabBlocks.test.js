import { jest } from '@jest/globals'
import { getMocks } from '../../__setup__/tabBlocks/tabBlocks.setup';
import { ApiMessages, CollectionTypes } from '../../../src/constants';
const { runTabBlocks: sut } = await import('../../../src/services/tabBlocksFlow/tabBlocks');
import { 
    tabBlocksByIdMock, 
    tabBlocksTabBlocksMock,
    runFlowItemCreatedMock
} from '../../__mocks__/tabBlocks/tabBlocks.mocks';

let getTabBlocksById, 
    getTabBlocksTabBlocks, 
    runTabBlockLabel, 
    runContentBlocks, 
    runExpansionPanels, 
    createTabBlocksTabBlocks, 
    createTabBlock,
    runTabBlocksTabBlocks;

beforeAll(async () => {
    const mocks = await getMocks();
    getTabBlocksById = mocks.getTabBlocksById;
    getTabBlocksTabBlocks = mocks.getTabBlocksTabBlocks;
    runTabBlockLabel = mocks.runTabBlockLabel;
    runContentBlocks = mocks.runContentBlocks;
    runExpansionPanels = mocks.runExpansionPanels;
    createTabBlocksTabBlocks = mocks.createTabBlocksTabBlocks;
    createTabBlock = mocks.createTabBlock;
    runTabBlocksTabBlocks = mocks.runTabBlocksTabBlocks;
});

describe('Tab blocks flow', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('Add tab block should return ITEM_CREATED', async () => {
        // Arrange
        getTabBlocksById.mockResolvedValueOnce(tabBlocksByIdMock)
            .mockResolvedValueOnce(null);
        runTabBlocksTabBlocks.mockResolvedValue([]);

        createTabBlock.mockResolvedValueOnce({
            id: tabBlocksByIdMock.id,
            collection: CollectionTypes.TAB_BLOCKS,
            message: ApiMessages.ITEM_CREATED
        });

        getTabBlocksTabBlocks.mockResolvedValueOnce(tabBlocksTabBlocksMock);

        var tabBlocksTabBlocks = [];
        tabBlocksTabBlocksMock.forEach(tabBlock => {
            tabBlocksTabBlocks.push(tabBlock.id);
            switch (tabBlock.item.collection) {
                case CollectionTypes.TAB_BLOCK_LABEL:
                    runTabBlockLabel.mockResolvedValueOnce(runFlowItemCreatedMock(tabBlock.item));
                    break;
                case CollectionTypes.CONTENT_BLOCKS:
                    runContentBlocks.mockResolvedValueOnce(runFlowItemCreatedMock(tabBlock.item));
                    break;
                case CollectionTypes.EXPANSION_PANELS:
                    runExpansionPanels.mockResolvedValueOnce(runFlowItemCreatedMock(tabBlock.item));
                    break;
            }

        });

        createTabBlocksTabBlocks.mockResolvedValueOnce(tabBlocksTabBlocks);

        // Act
        const result = await sut(tabBlocksByIdMock.id);

        // Assert
        expect(result.find(change => change.message === ApiMessages.ITEM_CREATED && change.collection === CollectionTypes.TAB_BLOCKS)).toBeTruthy();
    });

    test('Calls runTabBlocksTabBlocks', async () => {
        // Arrange
        getTabBlocksById.mockResolvedValue(tabBlocksByIdMock);
        runTabBlocksTabBlocks.mockResolvedValue([]);

        // Act
        await sut(tabBlocksByIdMock.id)

        // Assert
        expect(runTabBlocksTabBlocks).toHaveBeenCalled();
    });

    test('Results from tab blocks tab blocks are included in results', async () => {
        // Arrange
        getTabBlocksById.mockResolvedValue(tabBlocksByIdMock);
        runTabBlocksTabBlocks.mockResolvedValue([runFlowItemCreatedMock({
            id: 9999,
            collection: CollectionTypes.TAB_BLOCKS_TAB_BLOCKS
        })]);

        // Act
        const results = await sut(tabBlocksByIdMock.id)

        // Assert
        expect(results.find(change => change.collection === CollectionTypes.TAB_BLOCKS_TAB_BLOCKS && change.message === ApiMessages.ITEM_CREATED)).toBeTruthy();
    });
});

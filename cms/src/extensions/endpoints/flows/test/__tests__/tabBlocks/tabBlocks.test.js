import { jest } from '@jest/globals'
import { getMocks } from '../../__setup__/tabBlocks/tabBlocks.setup';
import { ApiMessages, CollectionTypes } from '../../../src/constants';
const { runTabBlocks: sut } = await import('../../../src/services/tabBlocksFlow/tabBlocks');
import { 
    tabBlocksByIdMock, 
    tabBlocksTabBlocksMock,
    runFlowItemCreatedMock
} from '../../__mocks__/tabBlocks.mocks';

let getTabBlocksById, getTabBlocksTabBlocks, runTabBlockLabel, runContentBlocks, runExpansionPanels, createTabBlocksTabBlocks, createTabBlock;

beforeAll(async () => {
    const mocks = await getMocks();
    getTabBlocksById = mocks.getTabBlocksById;
    getTabBlocksTabBlocks = mocks.getTabBlocksTabBlocks;
    runTabBlockLabel = mocks.runTabBlockLabel;
    runContentBlocks = mocks.runContentBlocks;
    runExpansionPanels = mocks.runExpansionPanels;
    createTabBlocksTabBlocks = mocks.createTabBlocksTabBlocks;
    createTabBlock = mocks.createTabBlock;
});

describe('Tab blocks flow', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('No changes should return NO_CHANGES', async () => {
        // Arrange
        getTabBlocksById.mockResolvedValueOnce(tabBlocksByIdMock)
            .mockResolvedValueOnce(tabBlocksByIdMock);

        // Act
        const result = await sut(tabBlocksByIdMock.id);

        // Assert
        expect(result.message).toEqual(ApiMessages.NO_CHANGES);
        expect(getTabBlocksById).toHaveBeenCalledTimes(2);
    });

    test('Add tab block should return ITEM_CREATED', async () => {
        // Arrange
        getTabBlocksById.mockResolvedValueOnce(tabBlocksByIdMock)
            .mockResolvedValueOnce(null);

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
        expect(result.message).toEqual(ApiMessages.ITEM_CREATED);
    });

    test('Adding tab blocks to existing block should return ITEM_CREATED', async () => {
        // Arrange
        const latestTabBlocks = { ...tabBlocksByIdMock };
        const previousTabBlocks = { ...tabBlocksByIdMock };
        getTabBlocksById.mockResolvedValueOnce(latestTabBlocks)
            .mockResolvedValueOnce(previousTabBlocks);

        // Act
        const result = await sut(tabBlocksByIdMock.id);
        
        // Assert
        expect(result.message).toEqual(ApiMessages.NO_CHANGES);
    });
});

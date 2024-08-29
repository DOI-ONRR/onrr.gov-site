import { jest } from '@jest/globals'
import { getMocks } from '../../__setup__/tabBlocks/tabBlocksTabBlocks.setup';
import { 
    tabBlockId,
    tabBlocksTabBlocksLatest,
    runFlowItemNoChangesMock,
    tabBlocksTabBlocksCardBlock,
    tabBlocksTabBlocksContentBlock,
    tabBlocksTabBlocksExpansionPanel,
    tabBlocksTabBlocksTabBlock,
    tabBlocksTabBlocksTabLabel,
    tabBlocksTabBlocksPrevious
} from '../../__mocks__/tabBlocks/tabBlocksTabBlocks.mocks';
import { ApiMessages, CollectionTypes } from '../../../src/constants';
const { runTabBlocksTabBlocks: sut } = await import('../../../src/services/tabBlocksFlow/tabBlocksTabBlocks');

let getTabBlocksTabBlocks, 
    runCardBlocks, 
    runContentBlocks, 
    runExpansionPanels, 
    runTabBlocks, 
    runTabBlockLabel,
    runTabBlocksTabBlocksItem,
    deleteTabBlocksTabBlocksItem;

beforeAll(async () => {
    const mocks = await getMocks();
    getTabBlocksTabBlocks = mocks.getTabBlocksTabBlocks;
    runCardBlocks = mocks.runCardBlocks;
    runContentBlocks = mocks.runContentBlocks;
    runExpansionPanels = mocks.runExpansionPanels;
    runTabBlocks = mocks.runTabBlocks;
    runTabBlockLabel = mocks.runTabBlockLabel;
    runTabBlocksTabBlocksItem = mocks.runTabBlocksTabBlocksItem;
    deleteTabBlocksTabBlocksItem = mocks.deleteTabBlocksTabBlocksItem;
});

describe('Tab blocks tab blocks flow', () => {
    beforeEach(async() => {
        jest.resetAllMocks();
    });

    test('Calls getTabBlocksTabBlocks 2x', async () => {
        // Arrange
        getTabBlocksTabBlocks
            .mockResolvedValueOnce(tabBlocksTabBlocksLatest);

        // Act
        await sut(tabBlockId);

        // Assert
        expect(getTabBlocksTabBlocks).toHaveBeenCalledTimes(2);
    });

    test('Unchanged tab blocks returns no applied changes', async () => {
        // Arrange
        getTabBlocksTabBlocks
            .mockResolvedValueOnce(tabBlocksTabBlocksLatest)
            .mockResolvedValueOnce(tabBlocksTabBlocksLatest);
        
        tabBlocksTabBlocksLatest.forEach(block => {
            switch (block.item.collection) {
                case CollectionTypes.TAB_BLOCK_LABEL:
                    runTabBlockLabel.mockResolvedValueOnce(runFlowItemNoChangesMock(tabBlocksTabBlocksTabLabel[0].item));
                    break;
                case CollectionTypes.EXPANSION_PANELS:
                    runExpansionPanels.mockResolvedValueOnce(runFlowItemNoChangesMock(tabBlocksTabBlocksExpansionPanel[0].item));
                    break;
                case CollectionTypes.CONTENT_BLOCKS:
                    runContentBlocks.mockResolvedValueOnce(runFlowItemNoChangesMock(tabBlocksTabBlocksContentBlock[0].item))
                    break;
            }
        });

        runTabBlocksTabBlocksItem.mockResolvedValue(runFlowItemNoChangesMock(tabBlocksTabBlocksTabLabel[0].item))

        // Act
        const appliedChanges = await sut(tabBlockId);

        // Assert
        expect(appliedChanges.every(change => change.message === ApiMessages.NO_CHANGES)).toBeTruthy();
    });

    test('Changed tab block item returns one applied change', async () => {
        // Arrange
        getTabBlocksTabBlocks
            .mockResolvedValueOnce(tabBlocksTabBlocksLatest)
            .mockResolvedValueOnce(tabBlocksTabBlocksPrevious);

        tabBlocksTabBlocksLatest.forEach(block => {
            switch (block.item.collection) {
                case CollectionTypes.TAB_BLOCK_LABEL:
                    runTabBlockLabel.mockResolvedValueOnce(runFlowItemNoChangesMock(tabBlocksTabBlocksTabLabel[0].item));
                    break;
                case CollectionTypes.EXPANSION_PANELS:
                    runExpansionPanels.mockResolvedValueOnce(runFlowItemNoChangesMock(tabBlocksTabBlocksExpansionPanel[0].item));
                    break;
                case CollectionTypes.CONTENT_BLOCKS:
                    runContentBlocks.mockResolvedValueOnce(runFlowItemNoChangesMock(tabBlocksTabBlocksContentBlock[0].item))
                    break;
            }
        });

        runTabBlocksTabBlocksItem.mockResolvedValue(runFlowItemNoChangesMock(tabBlocksTabBlocksTabLabel[0].item));

        // Act
        const response = await sut(tabBlockId);

        // Assert
        //expect(response.length).toEqual(4);
    });

    test('runCardBlocks is called', async () => {
        // Arrange
        getTabBlocksTabBlocks
            .mockResolvedValueOnce(tabBlocksTabBlocksCardBlock);

        runCardBlocks.mockResolvedValueOnce(runFlowItemNoChangesMock(tabBlocksTabBlocksCardBlock[0].item))

        // Act
        await sut(tabBlockId);

        // Assert
        expect(runCardBlocks).toHaveBeenCalled();
    });

    test('runContentBlocks is called', async () => {
        // Arrange
        getTabBlocksTabBlocks
            .mockResolvedValueOnce(tabBlocksTabBlocksContentBlock);

        runContentBlocks.mockResolvedValueOnce(runFlowItemNoChangesMock(tabBlocksTabBlocksContentBlock[0].item))

        // Act
        await sut(tabBlockId);

        // Assert
        expect(runContentBlocks).toHaveBeenCalled();
    });

    test('runExpansionPanels is called', async () => {
        // Arrange
        getTabBlocksTabBlocks
            .mockResolvedValueOnce(tabBlocksTabBlocksExpansionPanel);

            runExpansionPanels.mockResolvedValueOnce(runFlowItemNoChangesMock(tabBlocksTabBlocksExpansionPanel[0].item))

        // Act
        await sut(tabBlockId);

        // Assert
        expect(runExpansionPanels).toHaveBeenCalled();
    });

    test('runTabBlocks is called', async () => {
        // Arrange
        getTabBlocksTabBlocks
            .mockResolvedValueOnce(tabBlocksTabBlocksTabBlock);

            runTabBlocks.mockResolvedValueOnce(runFlowItemNoChangesMock(tabBlocksTabBlocksTabBlock[0].item))

        // Act
        await sut(tabBlockId);

        // Assert
        expect(runTabBlocks).toHaveBeenCalled();
    });

    test('runTabBlockLabel is called', async () => {
        // Arrange
        getTabBlocksTabBlocks
            .mockResolvedValueOnce(tabBlocksTabBlocksTabLabel);

            runTabBlockLabel.mockResolvedValueOnce(runFlowItemNoChangesMock(tabBlocksTabBlocksTabLabel[0].item))

        // Act
        await sut(tabBlockId);

        // Assert
        expect(runTabBlockLabel).toHaveBeenCalled();
    });

    test('runTabBlockTabBlockItem is called', async () => {
        // Arrange
        getTabBlocksTabBlocks
            .mockResolvedValueOnce(tabBlocksTabBlocksTabLabel);

            runTabBlocksTabBlocksItem.mockResolvedValueOnce(runFlowItemNoChangesMock(tabBlocksTabBlocksTabLabel[0].item))

        // Act
        await sut(tabBlockId);

        // Assert
        expect(runTabBlocksTabBlocksItem).toHaveBeenCalled();
    });

    test('deleteTabBlocksTabBlocksItem is called', async () => {
        // Arrange
        const previous = [...tabBlocksTabBlocksLatest];
        const latest = tabBlocksTabBlocksLatest.slice(0, -1);
        getTabBlocksTabBlocks
            .mockResolvedValueOnce(latest)
            .mockResolvedValueOnce(previous);

        // Act
        await sut(tabBlockId);

        // Assert
        expect(deleteTabBlocksTabBlocksItem).toHaveBeenCalled();
    });

    test('Applied changes includes ITEM_DELETED', async () => {
        // Arrange
        const previous = [...tabBlocksTabBlocksLatest];
        const latest = tabBlocksTabBlocksLatest.slice(0, -1);
        getTabBlocksTabBlocks
            .mockResolvedValueOnce(latest)
            .mockResolvedValueOnce(previous);

        runTabBlockLabel.mockResolvedValueOnce(runFlowItemNoChangesMock(tabBlocksTabBlocksTabLabel[0].item))
            .mockResolvedValueOnce(runFlowItemNoChangesMock(tabBlocksTabBlocksTabLabel[0].item));

        runExpansionPanels.mockResolvedValueOnce(runFlowItemNoChangesMock(tabBlocksTabBlocksExpansionPanel[0].item));

        runTabBlocksTabBlocksItem.mockResolvedValue(runFlowItemNoChangesMock(tabBlocksTabBlocksTabLabel[0].item))

        deleteTabBlocksTabBlocksItem.mockResolvedValueOnce(2029)

        // Act
        const appliedChanges = await sut(tabBlockId);

        // Assert
        expect(appliedChanges.some(change => change.message === ApiMessages.ITEM_DELETED)).toBeTruthy();
    });
});
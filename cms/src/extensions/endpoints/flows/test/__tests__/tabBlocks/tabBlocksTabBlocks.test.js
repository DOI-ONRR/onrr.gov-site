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
    deleteTabBlocksTabBlocksItem,
    createTabBlocksTabBlocksItem,
    updateTabBlocksTabBlocksItem;

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
    createTabBlocksTabBlocksItem = mocks.createTabBlocksTabBlocksItem;
    updateTabBlocksTabBlocksItem = mocks.updateTabBlocksTabBlocksItem;
});

describe('Tab blocks tab blocks flow', () => {
    beforeEach(async() => {
        jest.resetAllMocks();
    });

    test('Calls getTabBlocksTabBlocks 2x', async () => {
        // Arrange
        getTabBlocksTabBlocks
            .mockResolvedValue(tabBlocksTabBlocksLatest);

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

    test('Addition of tab block item at end calls createTabBlocksTabBlocksItem', async () => {
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
        await sut(tabBlockId);

        // Assert
        expect(createTabBlocksTabBlocksItem).toHaveBeenCalled();
    });

    test('Addition of tab block item at beginning calls createTabBlocksTabBlocksItem and updateTabBlocksTabBlocksItem', async () => {
        // Arrange
        var latest = tabBlocksTabBlocksLatest.splice(2, 1);
        latest = [...latest, ...JSON.parse(JSON.stringify(tabBlocksTabBlocksPrevious))];
        latest[1].Sort = 2;
        latest[2].Sort = 3;
        getTabBlocksTabBlocks
            .mockResolvedValueOnce(latest)
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
        await sut(tabBlockId);

        // Assert
        expect(createTabBlocksTabBlocksItem).toHaveBeenCalled();
        expect(updateTabBlocksTabBlocksItem).toHaveBeenCalled();
    });

    test('runCardBlocks is called', async () => {
        // Arrange
        getTabBlocksTabBlocks
            .mockResolvedValue(tabBlocksTabBlocksCardBlock);

        runCardBlocks.mockResolvedValueOnce(runFlowItemNoChangesMock(tabBlocksTabBlocksCardBlock[0].item))

        // Act
        await sut(tabBlockId);

        // Assert
        expect(runCardBlocks).toHaveBeenCalled();
    });

    test('runContentBlocks is called', async () => {
        // Arrange
        getTabBlocksTabBlocks
            .mockResolvedValue(tabBlocksTabBlocksContentBlock);

        runContentBlocks.mockResolvedValueOnce(runFlowItemNoChangesMock(tabBlocksTabBlocksContentBlock[0].item))

        // Act
        await sut(tabBlockId);

        // Assert
        expect(runContentBlocks).toHaveBeenCalled();
    });

    test('runExpansionPanels is called', async () => {
        // Arrange
        getTabBlocksTabBlocks
            .mockResolvedValue(tabBlocksTabBlocksExpansionPanel);

            runExpansionPanels.mockResolvedValueOnce(runFlowItemNoChangesMock(tabBlocksTabBlocksExpansionPanel[0].item))

        // Act
        await sut(tabBlockId);

        // Assert
        expect(runExpansionPanels).toHaveBeenCalled();
    });

    test('runTabBlocks is called', async () => {
        // Arrange
        getTabBlocksTabBlocks
            .mockResolvedValue(tabBlocksTabBlocksTabBlock);

            runTabBlocks.mockResolvedValueOnce(runFlowItemNoChangesMock(tabBlocksTabBlocksTabBlock[0].item))

        // Act
        await sut(tabBlockId);

        // Assert
        expect(runTabBlocks).toHaveBeenCalled();
    });

    test('runTabBlockLabel is called', async () => {
        // Arrange
        getTabBlocksTabBlocks
            .mockResolvedValue(tabBlocksTabBlocksTabLabel);

            runTabBlockLabel.mockResolvedValueOnce(runFlowItemNoChangesMock(tabBlocksTabBlocksTabLabel[0].item))

        // Act
        await sut(tabBlockId);

        // Assert
        expect(runTabBlockLabel).toHaveBeenCalled();
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

    test('Change in order of tab blocks calls updateTabBlocksTabBlocksItem', async () => {
        // Arrange
        var latest = JSON.parse(JSON.stringify(tabBlocksTabBlocksPrevious));
        latest[0].Sort = 2;
        latest[1].Sort = 1;
        getTabBlocksTabBlocks
            .mockResolvedValueOnce(latest)
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

        // Act
        await sut(tabBlockId);

        // Assert
        expect(updateTabBlocksTabBlocksItem).toHaveBeenCalledTimes(2);
    });
});
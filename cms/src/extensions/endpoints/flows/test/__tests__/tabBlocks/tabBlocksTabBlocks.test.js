import { jest } from '@jest/globals'
import { getMocks } from '../../__setup__/tabBlocks/tabBlocksTabBlocks.setup';
import { 
    tabBlockId,
    tabBlocksTabBlocksLatest,
    tabBlocksTabBlocksPrevious,
    runFlowItemNoChangesMock,
    tabBlocksTabBlocksCardBlock,
    tabBlocksTabBlocksContentBlock,
    tabBlocksTabBlocksExpansionPanel,
    tabBlocksTabBlocksTabBlock,
    tabBlocksTabBlocksTabLabel
} from '../../__mocks__/tabBlocksTabBlocks.mocks';
const { runTabBlocksTabBlocks: sut } = await import('../../../src/services/tabBlocksFlow/tabBlocksTabBlocks');

let getTabBlocksTabBlocks, 
    getTabBlocksTabBlocksById, 
    createTabBlocksTabBlocksItem, 
    updateTabBlocksTabBlocksItem, 
    runCardBlocks, 
    runContentBlocks, 
    runExpansionPanels, 
    runTabBlocks, 
    runTabBlockLabel,
    runTabBlocksTabBlocksItem;

beforeAll(async () => {
    const mocks = await getMocks();
    getTabBlocksTabBlocks = mocks.getTabBlocksTabBlocks;
    getTabBlocksTabBlocksById = mocks.getTabBlocksTabBlocksById;
    createTabBlocksTabBlocksItem = mocks.createTabBlocksTabBlocksItem;
    updateTabBlocksTabBlocksItem = mocks.updateTabBlocksTabBlocksItem;
    runCardBlocks = mocks.runCardBlocks;
    runContentBlocks = mocks.runContentBlocks;
    runExpansionPanels = mocks.runExpansionPanels;
    runTabBlocks = mocks.runTabBlocks;
    runTabBlockLabel = mocks.runTabBlockLabel;
    runTabBlocksTabBlocksItem = mocks.runTabBlocksTabBlocksItem
});

describe('Tab blocks tab blocks flow', () => {
    beforeEach(async() => {
        jest.resetAllMocks();
    });

    test('Calls getTabBlocksTabBlocks', async () => {
        // Arrange
        getTabBlocksTabBlocks
            .mockResolvedValueOnce(tabBlocksTabBlocksLatest);

        // Act
        await sut(tabBlockId);

        // Assert
        expect(getTabBlocksTabBlocks).toHaveBeenCalledTimes(1);
    });

    test('Unchanged tab blocks returns no applied changes', async () => {
        // Arrange
        getTabBlocksTabBlocks
            .mockResolvedValueOnce(tabBlocksTabBlocksLatest)
            .mockResolvedValueOnce(tabBlocksTabBlocksLatest);

        // Act
        const response = await sut(tabBlockId);

        // Assert
        expect(response.length).toEqual(0);
    });

    test('Changed tab block item returns one applied change', async () => {
        // Arrange
        getTabBlocksTabBlocks
            .mockResolvedValueOnce(tabBlocksTabBlocksLatest)
            .mockResolvedValueOnce(tabBlocksTabBlocksLatest);

        // Act
        const response = await sut(tabBlockId);

        // Assert
        expect(response.length).toEqual(1);
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
});
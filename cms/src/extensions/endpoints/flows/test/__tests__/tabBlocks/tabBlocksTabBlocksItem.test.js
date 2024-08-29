import { getMocks } from '../../__setup__/tabBlocks/tabBlocksTabBlocksItem.setup';
import { 
    itemId,
    tabBlocksTabBlocksItemPrevious,
    tabBlocksTabBlocksItemLatest
} from '../../__mocks__/tabBlocks/tabBlocksTabBlocksItem.mocks';
import { ApiMessages } from '../../../src/constants';
const { runTabBlocksTabBlocksItem: sut } = await import('../../../src/services/tabBlocksFlow/tabBlocksTabBlocksItem');

let getTabBlocksTabBlocksById, 
    createTabBlocksTabBlocksItem, 
    updateTabBlocksTabBlocksItem

beforeAll(async () => {
    const mocks = await getMocks();
    getTabBlocksTabBlocksById = mocks.getTabBlocksTabBlocksById;
    createTabBlocksTabBlocksItem = mocks.createTabBlocksTabBlocksItem;
    updateTabBlocksTabBlocksItem = mocks.updateTabBlocksTabBlocksItem;
});

describe('Tab blocks tab blocks item flow', () => {
    test('Calls getTabBlocksTabBlocksById 2x', async () => {
        // Arrange
        getTabBlocksTabBlocksById.mockResolvedValueOnce(tabBlocksTabBlocksItemLatest)
            .mockResolvedValueOnce(tabBlocksTabBlocksItemLatest);

        // Act
        await sut(itemId);

        // Assert
        expect(getTabBlocksTabBlocksById).toHaveBeenCalledTimes(2);
    });

    test('Calls createTabBlocksTabBlocksItem', async () => {
        // Arrange
        var latest = JSON.parse(JSON.stringify(tabBlocksTabBlocksItemLatest));
        getTabBlocksTabBlocksById.mockResolvedValueOnce(latest)
            .mockResolvedValueOnce(null);

        createTabBlocksTabBlocksItem.mockResolvedValueOnce(itemId);

        // Act
        await sut(itemId);

        // Assert
        expect(createTabBlocksTabBlocksItem).toHaveBeenCalled();
    });

    test('Returns object with ITEM_CREATED message', async () => {
        // Arrange
        var latest = JSON.parse(JSON.stringify(tabBlocksTabBlocksItemLatest));
        getTabBlocksTabBlocksById.mockResolvedValueOnce(latest)
            .mockResolvedValueOnce(null);

        createTabBlocksTabBlocksItem.mockResolvedValueOnce(itemId);

        // Act
        const result = await sut(itemId);

        // Assert
        expect(result.message).toBe(ApiMessages.ITEM_CREATED);
    });

    test('Calls updateTabBlocksTabBlocksItem', async () => {
        // Arrange
        var latest = JSON.parse(JSON.stringify(tabBlocksTabBlocksItemLatest));
        getTabBlocksTabBlocksById.mockResolvedValueOnce(latest)
            .mockResolvedValueOnce(tabBlocksTabBlocksItemPrevious);

        updateTabBlocksTabBlocksItem.mockResolvedValueOnce(tabBlocksTabBlocksItemPrevious);

        // Act
        await sut(itemId);

        // Assert
        expect(updateTabBlocksTabBlocksItem).toHaveBeenCalled();
    });

    test('Returns object with ITEM_UPDATED message', async () => {
        // Arrange
        var latest = JSON.parse(JSON.stringify(tabBlocksTabBlocksItemLatest));
        getTabBlocksTabBlocksById.mockResolvedValueOnce(latest)
            .mockResolvedValueOnce(tabBlocksTabBlocksItemPrevious);

        updateTabBlocksTabBlocksItem.mockResolvedValueOnce(tabBlocksTabBlocksItemPrevious);

        // Act
        const result = await sut(itemId);

        // Assert
        expect(result.message).toBe(ApiMessages.ITEM_UPDATED);
    });
});
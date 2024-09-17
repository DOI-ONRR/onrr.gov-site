import { jest } from '@jest/globals';
import { getMocks } from '../../__setup__/pages/pagesPageBlocks.setup';
import { ApiMessages, CollectionTypes } from '../../../src/constants';

const { runPagesPageBlocks: sut } = await import('../../../src/services/pagesFlow/pagesPageBlocks');

let getPagesPageBlocks,
    pageId,
    pagesPageBlocks,
    createPagesPageBlocksItem,
    deletePagesPageBlocksItem,
    updatePagesPageBlocksItem,
    runCardBlocks,
    runContentBlocks,
    runExpansionPanels,
    runTabBlocks;

beforeAll(async () => {
    const mocks = await getMocks();
    getPagesPageBlocks = mocks.getPagesPageBlocks;
    pageId = mocks.pageId;
    pagesPageBlocks = mocks.pagesPageBlocks;
    createPagesPageBlocksItem = mocks.createPagesPageBlocksItem;
    deletePagesPageBlocksItem = mocks.deletePagesPageBlocksItem;
    updatePagesPageBlocksItem = mocks.updatePagesPageBlocksItem;
    runCardBlocks = mocks.runCardBlocks;
    runContentBlocks = mocks.runContentBlocks;
    runExpansionPanels = mocks.runExpansionPanels;
    runTabBlocks = mocks.runTabBlocks;
});

describe('Pages page blocks flow', () => {
    beforeEach(async() => {
        jest.resetAllMocks();

        runCardBlocks.mockResolvedValue({
            id: 9996,
            collection: CollectionTypes.CARD_BLOCKS,
            message: ApiMessages.NO_CHANGES
        });
    
        runContentBlocks.mockResolvedValue({
            id: 9997,
            collection: CollectionTypes.CONTENT_BLOCKS,
            message: ApiMessages.NO_CHANGES
        });
    
        runExpansionPanels.mockResolvedValue({
            id: 9998,
            collection: CollectionTypes.EXPANSION_PANELS,
            message: ApiMessages.NO_CHANGES
        });
    
        runTabBlocks.mockResolvedValue({
            id: 9999,
            collection: CollectionTypes.TAB_BLOCKS,
            message: ApiMessages.NO_CHANGES
        });
    });

    test('Calls getPagesPageBlocks 2x', async () => {
        // Arrange
        getPagesPageBlocks.mockResolvedValueOnce(pagesPageBlocks)
            .mockResolvedValueOnce([]);

        // Act
        await sut(pageId);

        // Assert
        expect(getPagesPageBlocks).toHaveBeenCalledTimes(2);
    });

    test('Calls createPagesPageBlocksItem', async () => {
        // Arrange
        getPagesPageBlocks.mockResolvedValueOnce(pagesPageBlocks)
            .mockResolvedValueOnce([]);

        // Act
        await sut(pageId);

        // Assert()
        expect(createPagesPageBlocksItem).toHaveBeenCalled();
    });

    test('Creation of new page block item returns ITEM_CREATED', async () => {
        // Arrange
        getPagesPageBlocks.mockResolvedValueOnce(pagesPageBlocks)
            .mockResolvedValueOnce([]);

        // Act
        const results = await sut(pageId);

        // Assert
        expect(results.find(change => change.collection === CollectionTypes.PAGES_PAGE_BLOCKS && change.message === ApiMessages.ITEM_CREATED)).toBeTruthy();
    });

    test('Calls deletePagesPageBlocksItem', async () => {
        // Arrange
        const latest = pagesPageBlocks.slice(0, -1);
        getPagesPageBlocks.mockResolvedValueOnce(latest)
            .mockResolvedValueOnce(pagesPageBlocks);

        // Act
        await sut(pageId);

        // Assert
        expect(deletePagesPageBlocksItem).toHaveBeenCalled();
    });

    test('Delete of page block item returns ITEM_DELETED for PAGES_PAGE_BLOCKS', async () => {
        // Arrange
        const latest = pagesPageBlocks.slice(0, -1);
        getPagesPageBlocks.mockResolvedValueOnce(latest)
            .mockResolvedValueOnce(pagesPageBlocks);

        // Act
        const results = await sut(pageId);

        // Assert
        expect(results.find(change => change.collection === CollectionTypes.PAGES_PAGE_BLOCKS && change.message === ApiMessages.ITEM_DELETED)).toBeTruthy();
    });

    test('Calls updatePagesPageBlocksItem for sort change', async () => {
        // Arrange
        const latest = JSON.parse(JSON.stringify(pagesPageBlocks));
        latest[0].sort = 2;
        latest[1].sort = 1;
        getPagesPageBlocks.mockResolvedValueOnce(latest)
            .mockResolvedValueOnce(pagesPageBlocks);

        // Act
        await sut(pageId);

        // Assert
        expect(updatePagesPageBlocksItem).toHaveBeenCalled();
    });

    test('Sorting change returns ITEM_UPDATED for PAGES_PAGE_BLOCKS', async () => {
        // Arrange
        const latest = JSON.parse(JSON.stringify(pagesPageBlocks));
        latest[0].sort = 2;
        latest[1].sort = 1;
        getPagesPageBlocks.mockResolvedValueOnce(latest)
            .mockResolvedValueOnce(pagesPageBlocks);

        // Act
        const results = await sut(pageId);

        // Assert
        expect(results.find(change => change.collection === CollectionTypes.PAGES_PAGE_BLOCKS && change.message === ApiMessages.ITEM_UPDATED)).toBeTruthy();
    });

    test('Calls createPagesPageBlocksItem for new page block at end', async () => {
        // Arrange
        const previous = pagesPageBlocks.slice(0, -1);
        getPagesPageBlocks.mockResolvedValueOnce(pagesPageBlocks)
            .mockResolvedValueOnce(previous);

        // Act
        await sut(pageId);

        // Assert
        expect(createPagesPageBlocksItem).toHaveBeenCalled();
    });

    test('New block at end returns ITEM_CREATED for PAGES_PAGE_BLOCKS', async () => {
        // Arrange
        const previous = pagesPageBlocks.slice(0, -1);
        getPagesPageBlocks.mockResolvedValueOnce(pagesPageBlocks)
            .mockResolvedValueOnce(previous);

        // Act
        const results = await sut(pageId);

        // Assert
        expect(results.find(change => change.collection === CollectionTypes.PAGES_PAGE_BLOCKS && change.message === ApiMessages.ITEM_CREATED)).toBeTruthy();
    });

    test('Calls updatePagesPageBlocksItem for new page block at beginning', async () => {
        // Arrange
        const previous = JSON.parse(JSON.stringify(pagesPageBlocks)).slice(1);
        for (var i = 0; i < previous.length; i++) {
            previous[i].sort = i + 1;
        }
        getPagesPageBlocks.mockResolvedValueOnce(pagesPageBlocks)
            .mockResolvedValueOnce(previous);

        // Act
        await sut(pageId);

        // Assert
        expect(updatePagesPageBlocksItem).toHaveBeenCalled();
    });

    test('Calls createPagesPageBlocksItem for new page block at beginning', async () => {
        // Arrange
        const previous = JSON.parse(JSON.stringify(pagesPageBlocks)).slice(1);
        for (var i = 0; i < previous.length; i++) {
            previous[i].sort = i + 1;
        }
        getPagesPageBlocks.mockResolvedValueOnce(pagesPageBlocks)
            .mockResolvedValueOnce(previous);

        // Act
        await sut(pageId);

        // Assert
        expect(createPagesPageBlocksItem).toHaveBeenCalled();
    });

    test('New block at beginning returns ITEM_UPDATED for PAGES_PAGE_BLOCKS', async () => {
        // Arrange
        runContentBlocks.mockResolvedValue({
            id: 9997,
            collection: CollectionTypes.CONTENT_BLOCKS,
            message: ApiMessages.ITEM_UPDATED
        });
        const latest = JSON.parse(JSON.stringify(pagesPageBlocks));
        latest[0].sort = 2;
        latest[1].sort = 1;
        getPagesPageBlocks.mockResolvedValueOnce(latest)
            .mockResolvedValueOnce(pagesPageBlocks);

        // Act
        const results = await sut(pageId);

        // Assert
        expect(results.find(change => change.collection === CollectionTypes.PAGES_PAGE_BLOCKS && change.message === ApiMessages.ITEM_UPDATED));
    });
});
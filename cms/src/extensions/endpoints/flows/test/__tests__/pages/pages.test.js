import { jest } from '@jest/globals';
import { getMocks } from '../../__setup__/pages/pages.setup';
import { ApiMessages, CollectionTypes } from '../../../src/constants';
const { runPages: sut } = await import('../../../src/services/pagesFlow');

let getPagesById,
    pageId,
    pagesById,
    createPagesItem,
    createPage,
    updatePagesItem,
    runPagesPageBlocks,
    runPagesPageBlocksResults;

beforeAll(async () => {
    const mocks = await getMocks();
    getPagesById = mocks.getPagesById;
    pagesById = mocks.pagesById;
    createPagesItem = mocks.createPagesItem;
    createPage = mocks.createPage;
    pageId = mocks.pageId;
    updatePagesItem = mocks.updatePagesItem;
    runPagesPageBlocks = mocks.runPagesPageBlocks;
    runPagesPageBlocksResults = mocks.runPagesPageBlocksResults;
});

describe('Test pages flow', () => {
    beforeEach(async() => {
        jest.resetAllMocks();
    });

    test('getPagesById is called 2x', async () => {
        // Act
        await sut(pageId);

        // Assert
        expect(getPagesById).toHaveBeenCalledTimes(2);
    });

    test('No changes message is NO_CHANGES', async () => {
        // Arrange
        getPagesById.mockResolvedValue(pagesById);

        // Act
        const result = await sut(pageId);

        // Assert
        expect(result.find(change => change.collection === CollectionTypes.PAGES && change.message === ApiMessages.NO_CHANGES)).toBeTruthy();
    });

    test('createPagesItem is called', async () => {
        // Arrange
        getPagesById.mockResolvedValueOnce(createPage);

        // Act
        await sut(pageId);

        // Assert
        expect(createPagesItem).toHaveBeenCalled();
    });

    test('Creating page returns ITEM_ADDED', async () => {
        // Arrange
        getPagesById.mockResolvedValueOnce(createPage);
        createPagesItem.mockResolvedValue(pageId);

        // Act
        const results = await sut(pageId);

        // Assert
        expect(results.some(change => change.message === ApiMessages.ITEM_CREATED && change.collection === CollectionTypes.PAGES)).toBeTruthy();
    });

    test('updatePagesItem is called', async () => {
        // Arrange
        const latest = {...createPage};
        latest.title = 'Updated Floofs';
        const previous = {...createPage}
        getPagesById.mockResolvedValueOnce(latest)
            .mockResolvedValueOnce(previous);

        // Act
        await sut(pageId);

        // Assert
        expect(updatePagesItem).toHaveBeenCalled();
    });

    test('Updating page returns ITEM_UPDATED', async () => {
        // Arrange
        const latest = {...createPage};
        latest.title = 'Updated Floofs';
        const previous = {...createPage}
        getPagesById.mockResolvedValueOnce(latest)
            .mockResolvedValueOnce(previous);

        // Act
        const results = await sut(pageId);

        // Assert
        expect(results.some(change => change.message === ApiMessages.ITEM_UPDATED && change.collection === CollectionTypes.PAGES)).toBeTruthy();
    });

    test('runPagesPageBlocks is called', async () => {
        // Arrange
        getPagesById.mockResolvedValue(pagesById);
        runPagesPageBlocks.mockResolvedValue(runPagesPageBlocksResults);

        // Act
        await sut(pageId);

        // Assert
        expect(runPagesPageBlocks).toHaveBeenCalled();
    });
});
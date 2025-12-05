import { jest } from '@jest/globals';
import { getMocks } from '../../__setup__/pages/pagesSidebarBlocks.setup';

const { runPagesSidebarBlocks: sut } = await import('../../../src/services/pagesFlow/pagesSidebarBlocks');

let getPagesSidebarBlocks,
  pageId,
  pagesSidebarBlocks,
  createPagesSidebarBlocksItem,
  deletePagesSidebarBlocksItem,
  updatePagesSidebarBlocksItem,
  runContentBlocks,
  runCollectionBlocks

beforeAll(async () => {
  const mocks = await getMocks();
  getPagesSidebarBlocks = mocks.getPagesSidebarBlocks;
  pageId = mocks.pageId;
  pagesSidebarBlocks = mocks.pagesSidebarBlocks;
  createPagesSidebarBlocksItem = mocks.createPagesSidebarBlocksItem;
  deletePagesSidebarBlocksItem = mocks.deletePagesSidebarBlocksItem;
  updatePagesSidebarBlocksItem = mocks.updatePagesSidebarBlocksItem;
  runContentBlocks = mocks.runContentBlocks;
  runCollectionBlocks = mocks.runCollectionBlocks;
});

describe('Pages sidebar blocks flow', () => {
  beforeEach(async() => {
    jest.resetAllMocks();
  })

  test('Calls getPagesSidebarBlocks', async () => {
    // Arrange
    getPagesSidebarBlocks.mockResolvedValueOnce(pagesSidebarBlocks)
      .mockResolvedValueOnce([]);

    // Act
    await sut(pageId);

    // Assert
    expect(getPagesSidebarBlocks).toHaveBeenCalled();
  });

  test('Calls runContentBlocks', async () => {
    // Arrange
    getPagesSidebarBlocks.mockResolvedValueOnce(pagesSidebarBlocks)
      .mockResolvedValueOnce([]);

    // Act
    await sut(pageId)

    // Assert
    expect(runContentBlocks).toHaveBeenCalled();
  })

  test('Calls runCollectionBlocks', async () => {
    // Arrange
    getPagesSidebarBlocks.mockResolvedValueOnce(pagesSidebarBlocks)
      .mockResolvedValueOnce([]);

    // Act
    await sut(pageId)

    // Assert
    expect(runCollectionBlocks).toHaveBeenCalled();
  })

  test('Calls createPagesSidebarBlocksItem', async () => {
    // Arrange
    getPagesSidebarBlocks.mockResolvedValueOnce(pagesSidebarBlocks)
      .mockResolvedValueOnce([]);

    // Act
    await sut(pageId)

    // Assert
    expect(createPagesSidebarBlocksItem).toHaveBeenCalledTimes(2);
  })

  test('Does not call updatePagesSidebarBlocksItem for create', async () => {
    // Arrange
    getPagesSidebarBlocks.mockResolvedValueOnce(pagesSidebarBlocks)
      .mockResolvedValueOnce([]);

    // Act
    await sut(pageId)

    // Assert
    expect(updatePagesSidebarBlocksItem).toHaveBeenCalledTimes(0);
  })

  test('Calls updatePagesSidebarBlocksItem', async () => {
    // Arrange
    const updatedSidebarBlocks = structuredClone(pagesSidebarBlocks)
    updatedSidebarBlocks[1].sort = 2
    
    getPagesSidebarBlocks.mockResolvedValueOnce(pagesSidebarBlocks)
      .mockResolvedValueOnce(updatedSidebarBlocks);

    // Act
    await sut(pageId)

    // Assert
    expect(updatePagesSidebarBlocksItem).toHaveBeenCalledTimes(1);
  })

  test('Does not call createPagesSidebarBlocksItem for update', async () => {
    // Arrange
    const updatedSidebarBlocks = structuredClone(pagesSidebarBlocks)
    updatedSidebarBlocks[1].sort = 2
    
    getPagesSidebarBlocks.mockResolvedValueOnce(pagesSidebarBlocks)
      .mockResolvedValueOnce(updatedSidebarBlocks);

    // Act
    await sut(pageId)

    // Assert
    expect(createPagesSidebarBlocksItem).toHaveBeenCalledTimes(0);
  })

  test('Calls deletePagesSidebarBlocksItem', async () => {
    // Arrange
    const updatedSidebarBlocks = structuredClone(pagesSidebarBlocks)
    pagesSidebarBlocks.pop()
    
    getPagesSidebarBlocks.mockResolvedValueOnce(pagesSidebarBlocks)
      .mockResolvedValueOnce(updatedSidebarBlocks);

    // Act
    await sut(pageId)

    // Assert
    expect(deletePagesSidebarBlocksItem).toHaveBeenCalledTimes(1);
  })
})
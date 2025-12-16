import { jest } from '@jest/globals';
import { getMocks } from '../../__setup__/collectionBlocks/collectionBlocks.setup';
const { runCollectionBlocks: sut } = await import('../../../src/services/collectionBlocksFlow/collectionBlocks');

let getCollectionBlocksById,
    createCollectionBlocksItem,
    updateCollectionBlocksItem,
    id,
    item;

beforeAll(async () => {
    const mocks = await getMocks();
    getCollectionBlocksById = mocks.getCollectionBlocksById;
    createCollectionBlocksItem = mocks.createCollectionBlocksItem;
    updateCollectionBlocksItem = mocks.updateCollectionBlocksItem;
    id = mocks.id;
    item = mocks.item;
});

describe('Test collection_blocks flow', () => {
    beforeEach(async() => {
        jest.resetAllMocks();
        getCollectionBlocksById.mockResolvedValueOnce(item)
          .mockResolvedValueOnce(null);
    });

    test('Calls getCollectionBlocksById 2x', async() => {
      // Act
      await sut(id);

      // Assert
      expect(getCollectionBlocksById).toHaveBeenCalledTimes(2);
    });

    test('Calls createCollectionBlocksItem', async () => {
      // Act
      await sut(id);

      // Assert
      expect(createCollectionBlocksItem).toHaveBeenCalled();
    });

    test('Calls updateCollectionBlocksItem with change in topics', async () => {
      // Arrange
      jest.resetAllMocks();
      const previousItem = structuredClone(item);
      previousItem.topics = [];
      getCollectionBlocksById.mockResolvedValueOnce(item)
        .mockResolvedValueOnce(previousItem);

      // Act
      await sut(id);

      // Assert
      expect(updateCollectionBlocksItem).toHaveBeenCalled();
    });

    test('Calls updateCollectionBlocksItem with change in collection', async () => {
      // Arrange
      jest.resetAllMocks();
      const previousItem = structuredClone(item);
      previousItem.collection = 'press_releases';
      getCollectionBlocksById.mockResolvedValueOnce(item)
        .mockResolvedValueOnce(previousItem);

      // Act
      await sut(id);

      // Assert
      expect(updateCollectionBlocksItem).toHaveBeenCalled();
    });
});
import { jest } from '@jest/globals'

// Keep an eye on ESM mocking at https://jestjs.io/docs/ecmascript-modules#module-mocking-in-esm
jest.unstable_mockModule('../../src/operations/tabBlocks/getTabBlocksById', () => ({
    getTabBlocksById: jest.fn()
}));

jest.unstable_mockModule('../../src/operations/tabBlocks/getTabBlocksTabBlocks', () => ({
    getTabBlocksTabBlocks: jest.fn()
}));

jest.unstable_mockModule('../../src/operations/tabBlocks/createTabBlock', () => ({
    createTabBlock: jest.fn()
}));

jest.unstable_mockModule('../../src/services/tabBlocksFlow/tabBlockLabel', () => ({
    runTabBlockLabel: jest.fn()
}));

jest.unstable_mockModule('../../src/services/contentBlocksFlow/contentBlocks', () => ({
    runContentBlocks: jest.fn()
}));

jest.unstable_mockModule('../../src/services/expansionPanelsFlow/expansionPanels', () => ({
    runExpansionPanels: jest.fn()
}));

jest.unstable_mockModule('../../src/operations/tabBlocks/createTabBlocksTabBlocks', () => ({
    createTabBlocksTabBlocks: jest.fn()
}));

const { getTabBlocksById } = await import('../../src/operations/tabBlocks/getTabBlocksById');
const { getTabBlocksTabBlocks } = await import('../../src/operations/tabBlocks/getTabBlocksTabBlocks');
const { runTabBlockLabel } = await import('../../src/services/tabBlocksFlow/tabBlockLabel');
const { runContentBlocks } = await import('../../src/services/contentBlocksFlow/contentBlocks');
const { runExpansionPanels } = await import('../../src/services/expansionPanelsFlow/expansionPanels');
const { createTabBlocksTabBlocks } = await import('../../src/operations/tabBlocks/createTabBlocksTabBlocks');
const { createTabBlock } = await import('../../src/operations/tabBlocks/createTabBlock');

import { ApiMessages, CollectionTypes } from '../../src/constants';
const { default: runTabBlocks } = await import('../../src/services/tabBlocksFlow/tabBlocks');
import { 
    tabBlocksByIdMock, 
    tabBlocksTabBlocksMock,
    runFlowItemCreatedMock
} from '../__mocks__/tabBlocksFlowUtil.mocks';

describe('Tab blocks flow', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('no changes should return NO_CHANGES', async () => {
        getTabBlocksById.mockResolvedValueOnce(tabBlocksByIdMock)
            .mockResolvedValueOnce(tabBlocksByIdMock);

        const result = await runTabBlocks(tabBlocksByIdMock.id);

        expect(result.message).toEqual(ApiMessages.NO_CHANGES);
        expect(getTabBlocksById).toHaveBeenCalledTimes(2);
    });

    test('add tab block should return ITEM_CREATED', async () => {
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

        const result = await runTabBlocks(tabBlocksByIdMock.id);

        expect(result.message).toEqual(ApiMessages.ITEM_CREATED);
    });
});

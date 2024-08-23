import { jest } from '@jest/globals'

jest.unstable_mockModule('../../src/operations/tabBlocks', () => ({
    getTabBlocksById: jest.fn(),
    createTabBlock: jest.fn(),
    createTabBlockLabelItem: jest.fn(),
    createTabBlocksTabBlocks: jest.fn(),
    createTabBlocksTabBlocksItem: jest.fn(),
    getTabBlockLabelById: jest.fn(),
    getTabBlocksByIdWithTabBlocks: jest.fn(),
    getTabBlocksTabBlocks: jest.fn(),
    getTabBlocksTabBlocksById: jest.fn(),
    updateTabBlockLabelItem: jest.fn(),
    updateTabBlocksItem: jest.fn(),
    updateTabBlocksTabBlocksItem: jest.fn()
}));

const { getTabBlocksById } = await import('../../src/operations/tabBlocks');

import { ApiMessages } from '../../src/constants';
const { run } = await import('../../src/utils/tabBlocksFlowUtil');
import { tabBlocksByIdMock } from '../__mocks__/tabBlocksFlowUtil.mocks';

describe('Tab blocks flow', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('no changes should return NO_CHANGES', async () => {
        getTabBlocksById.mockResolvedValueOnce(tabBlocksByIdMock)
            .mockResolvedValueOnce(tabBlocksByIdMock);

        const result = await run(146);

        expect(result.message).toEqual(ApiMessages.NO_CHANGES);
        expect(getTabBlocksById).toHaveBeenCalledTimes(2);
    });
});

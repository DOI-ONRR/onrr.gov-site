import { jest } from '@jest/globals'

jest.unstable_mockModule('node:child_process', () => ({
    getTabBlocksById: jest.fn(),
}));

const { getTabBlocksById } = await import('node:child_process');

import { ApiMessages } from '../../src/constants';
import { run } from '../../src/utils/tabBlocksFlowUtil';
import { tabBlocksByIdMock } from '../__mocks__/tabBlocksFlowUtil.mocks';

test('no changes should return NO_CHANGES', async () => {
    const result = await run(146);

    getTabBlocksById.mockResolvedValueOnce(tabBlocksByIdMock)
        .mockResolvedValueOnce(tabBlocksByIdMock);

    expect(result.message).toEqual(ApiMessages.NO_CHANGES);
});

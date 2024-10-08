import { jest } from '@jest/globals'

jest.unstable_mockModule('../../../src/operations/tabBlocks/createTabBlocksTabBlocksItem', () => ({
    createTabBlocksTabBlocksItem: jest.fn()
}));

jest.unstable_mockModule('../../../src/operations/tabBlocks/updateTabBlocksTabBlocksItem', () => ({
    updateTabBlocksTabBlocksItem: jest.fn()
}));

export const getMocks = async () => {
    const { createTabBlocksTabBlocksItem } = await import('../../../src/operations/tabBlocks/createTabBlocksTabBlocksItem');
    const { updateTabBlocksTabBlocksItem } = await import('../../../src/operations/tabBlocks/updateTabBlocksTabBlocksItem');

    return {
        createTabBlocksTabBlocksItem,
        updateTabBlocksTabBlocksItem
    };
};
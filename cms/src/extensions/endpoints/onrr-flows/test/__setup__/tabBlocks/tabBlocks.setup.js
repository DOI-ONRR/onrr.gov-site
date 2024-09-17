import { jest } from '@jest/globals'

jest.unstable_mockModule('../../../src/operations/tabBlocks/getTabBlocksById', () => ({
    getTabBlocksById: jest.fn()
}));

jest.unstable_mockModule('../../../src/operations/tabBlocks/getTabBlocksTabBlocks', () => ({
    getTabBlocksTabBlocks: jest.fn()
}));

jest.unstable_mockModule('../../../src/operations/tabBlocks/createTabBlock', () => ({
    createTabBlock: jest.fn()
}));

jest.unstable_mockModule('../../../src/services/tabBlocksFlow/tabBlockLabel', () => ({
    runTabBlockLabel: jest.fn()
}));

jest.unstable_mockModule('../../../src/services/contentBlocksFlow/contentBlocks', () => ({
    runContentBlocks: jest.fn()
}));

jest.unstable_mockModule('../../../src/services/expansionPanelsFlow/expansionPanels', () => ({
    runExpansionPanels: jest.fn()
}));

jest.unstable_mockModule('../../../src/services/tabBlocksFlow/tabBlocksTabBlocks', () => ({
    runTabBlocksTabBlocks: jest.fn()
}));

export const getMocks = async () => {
    const { getTabBlocksById } = await import('../../../src/operations/tabBlocks/getTabBlocksById');
    const { getTabBlocksTabBlocks } = await import('../../../src/operations/tabBlocks/getTabBlocksTabBlocks');
    const { runTabBlockLabel } = await import('../../../src/services/tabBlocksFlow/tabBlockLabel');
    const { runTabBlocksTabBlocks } = await import('../../../src/services/tabBlocksFlow/tabBlocksTabBlocks');
    const { runContentBlocks } = await import('../../../src/services/contentBlocksFlow/contentBlocks');
    const { runExpansionPanels } = await import('../../../src/services/expansionPanelsFlow/expansionPanels');
    const { createTabBlock } = await import('../../../src/operations/tabBlocks/createTabBlock');

    return {
        getTabBlocksById,
        getTabBlocksTabBlocks,
        runTabBlockLabel,
        runContentBlocks,
        runExpansionPanels,
        createTabBlock,
        runTabBlocksTabBlocks
    };
};
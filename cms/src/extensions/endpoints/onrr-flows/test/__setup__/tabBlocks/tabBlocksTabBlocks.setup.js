import { jest } from '@jest/globals'

jest.unstable_mockModule('../../../src/operations/tabBlocks/getTabBlocksTabBlocks', () => ({
    getTabBlocksTabBlocks: jest.fn()
}));

jest.unstable_mockModule('../../../src/services/cardBlocksFlow/cardBlocks', () => ({
    runCardBlocks: jest.fn()
}));

jest.unstable_mockModule('../../../src/services/contentBlocksFlow/contentBlocks', () => ({
    runContentBlocks: jest.fn()
}));

jest.unstable_mockModule('../../../src/services/expansionPanelsFlow/expansionPanels', () => ({
    runExpansionPanels: jest.fn()
}));

jest.unstable_mockModule('../../../src/services/tabBlocksFlow/tabBlocks', () => ({
    runTabBlocks: jest.fn()
}));

jest.unstable_mockModule('../../../src/services/tabBlocksFlow/tabBlockLabel', () => ({
    runTabBlockLabel: jest.fn()
}));

jest.unstable_mockModule('../../../src/operations/tabBlocks/deleteTabBlocksTabBlocksItem', () => ({
    deleteTabBlocksTabBlocksItem: jest.fn()
}));

jest.unstable_mockModule('../../../src/operations/tabBlocks/createTabBlocksTabBlocksItem', () => ({
    createTabBlocksTabBlocksItem: jest.fn()
}));

jest.unstable_mockModule('../../../src/operations/tabBlocks/updateTabBlocksTabBlocksItem', () => ({
    updateTabBlocksTabBlocksItem: jest.fn()
}));

export const getMocks = async () => {
    const { getTabBlocksTabBlocks } = await import('../../../src/operations/tabBlocks/getTabBlocksTabBlocks');
    const { runCardBlocks } = await import('../../../src/services/cardBlocksFlow/cardBlocks');
    const { runContentBlocks } = await import('../../../src/services/contentBlocksFlow/contentBlocks');
    const { runExpansionPanels } = await import('../../../src/services/expansionPanelsFlow/expansionPanels');
    const { runTabBlocks } = await import('../../../src/services/tabBlocksFlow/tabBlocks');
    const { runTabBlockLabel } = await import('../../../src/services/tabBlocksFlow/tabBlockLabel');
    const { deleteTabBlocksTabBlocksItem } = await import('../../../src/operations/tabBlocks/deleteTabBlocksTabBlocksItem');
    const { createTabBlocksTabBlocksItem } = await import('../../../src/operations/tabBlocks/createTabBlocksTabBlocksItem');
    const { updateTabBlocksTabBlocksItem } = await import('../../../src/operations/tabBlocks/updateTabBlocksTabBlocksItem');

    return {
        getTabBlocksTabBlocks,
        runCardBlocks,
        runContentBlocks,
        runExpansionPanels,
        runTabBlocks,
        runTabBlockLabel,
        deleteTabBlocksTabBlocksItem,
        createTabBlocksTabBlocksItem,
        updateTabBlocksTabBlocksItem
    };
};
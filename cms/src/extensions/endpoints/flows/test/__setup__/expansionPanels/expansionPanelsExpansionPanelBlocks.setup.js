import { jest } from '@jest/globals'
import { expansionPanelId,
    expansionPanelsExpansionPanelBlocks,
    expansionPanelsExpansionPanelBlocksPrevious
 } from '../../__mocks__/expansionPanels/expansionPanelsExpansionPanelBlocks.mocks';

jest.unstable_mockModule('../../../src/operations/expansionPanels/getExpansionPanelsExpansionPanelBlocks', () => ({
    getExpansionPanelsExpansionPanelBlocks: jest.fn()
}));

jest.unstable_mockModule('../../../src/operations/expansionPanels/createExpansionPanelsExpansionPanelBlocksItem', () => ({
    createExpansionPanelsExpansionPanelBlocksItem: jest.fn()
}));

jest.unstable_mockModule('../../../src/operations/expansionPanels/deleteExpansionPanelsExpansionPanelBlocksItem', () => ({
    deleteExpansionPanelsExpansionPanelBlocksItem: jest.fn()
}));

jest.unstable_mockModule('../../../src/operations/expansionPanels/updateExpansionPanelsExpansionPanelBlocksItem', () => ({
    updateExpansionPanelsExpansionPanelBlocksItem: jest.fn()
}));

jest.unstable_mockModule('../../../src/services/cardBlocksFlow/cardBlocks', () => ({
    runCardBlocks: jest.fn()
}));

jest.unstable_mockModule('../../../src/services/contentBlocksFlow/contentBlocks', () => ({
    runContentBlocks: jest.fn()
}));

jest.unstable_mockModule('../../../src/services/expansionPanelsFlow/expansionPanelBlockLabel', () => ({
    runExpansionPanelBlockLabel: jest.fn()
}));

export const getMocks = async () => {
    const { getExpansionPanelsExpansionPanelBlocks } = await import('../../../src/operations/expansionPanels/getExpansionPanelsExpansionPanelBlocks');
    const { createExpansionPanelsExpansionPanelBlocksItem } = await import('../../../src/operations/expansionPanels/createExpansionPanelsExpansionPanelBlocksItem');
    const { deleteExpansionPanelsExpansionPanelBlocksItem } = await import('../../../src/operations/expansionPanels/deleteExpansionPanelsExpansionPanelBlocksItem');
    const { updateExpansionPanelsExpansionPanelBlocksItem } = await import('../../../src/operations/expansionPanels/updateExpansionPanelsExpansionPanelBlocksItem');
    const { runCardBlocks } = await import('../../../src/services/cardBlocksFlow/cardBlocks');
    const { runContentBlocks } = await import('../../../src/services/contentBlocksFlow/contentBlocks');
    const { runExpansionPanelBlockLabel } = await import('../../../src/services/expansionPanelsFlow/expansionPanelBlockLabel');

    return {
        getExpansionPanelsExpansionPanelBlocks,
        createExpansionPanelsExpansionPanelBlocksItem,
        deleteExpansionPanelsExpansionPanelBlocksItem,
        updateExpansionPanelsExpansionPanelBlocksItem,
        runCardBlocks,
        runContentBlocks,
        runExpansionPanelBlockLabel,
        expansionPanelId,
        expansionPanelsExpansionPanelBlocks,
        expansionPanelsExpansionPanelBlocksPrevious
    };
};
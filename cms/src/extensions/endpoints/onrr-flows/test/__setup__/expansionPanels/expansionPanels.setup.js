import { jest } from '@jest/globals'
import { expansionPanelId, expansionPanelsByIdLatest } from '../../__mocks__/expansionPanels/expansionPanels.mocks';

jest.unstable_mockModule('../../../src/operations/expansionPanels/getExpansionPanelsById', () => ({
    getExpansionPanelsById: jest.fn()
}));

jest.unstable_mockModule('../../../src/operations/expansionPanels/createExpansionPanelsItem', () => ({
    createExpansionPanelsItem: jest.fn()
}));

jest.unstable_mockModule('../../../src/operations/expansionPanels/updateExpansionPanelsItem', () => ({
    updateExpansionPanelsItem: jest.fn()
}));

jest.unstable_mockModule('../../../src/services/expansionPanelsFlow/expansionPanelsExpansionPanelBlocks', () => ({
    runExpansionPanelsExpansionPanelBlocks: jest.fn()
}));

export const getMocks = async () => {
    const { getExpansionPanelsById } = await import('../../../src/operations/expansionPanels/getExpansionPanelsById');
    const { createExpansionPanelsItem } = await import('../../../src/operations/expansionPanels/createExpansionPanelsItem');
    const { updateExpansionPanelsItem } = await import('../../../src/operations/expansionPanels/updateExpansionPanelsItem');
    const { runExpansionPanelsExpansionPanelBlocks } = await import('../../../src/services/expansionPanelsFlow/expansionPanelsExpansionPanelBlocks');

    return {
        getExpansionPanelsById,
        createExpansionPanelsItem,
        updateExpansionPanelsItem,
        runExpansionPanelsExpansionPanelBlocks,
        expansionPanelId,
        expansionPanelsByIdLatest
    };
};
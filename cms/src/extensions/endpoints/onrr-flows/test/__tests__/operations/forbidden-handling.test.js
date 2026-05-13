import { jest } from '@jest/globals';

// Mock graphql-request
const mockRequest = jest.fn();
jest.unstable_mockModule('graphql-request', () => ({
    GraphQLClient: jest.fn().mockImplementation(() => ({
        request: mockRequest,
        setHeaders: jest.fn(),
    })),
    gql: jest.fn((strings, ...values) => strings.join('')),
}));

// Mock logger
jest.unstable_mockModule('../../../src/utils/logger', () => ({
    logger: { error: jest.fn(), warn: jest.fn(), info: jest.fn() },
}));
jest.unstable_mockModule('../../../src/utils', () => ({
    logger: { error: jest.fn(), warn: jest.fn(), info: jest.fn() },
    previousVersionExists: jest.fn(),
    versionsDiffer: jest.fn(),
}));

// GraphQL FORBIDDEN error shape from graphql-request
const forbiddenError = {
    response: {
        errors: [
            {
                message: 'You don\'t have permission to access this.',
                extensions: { code: 'FORBIDDEN' },
            },
        ],
    },
};

// Non-FORBIDDEN error
const otherError = new Error('Network error');

const endpoint = 'http://localhost/graphql';
const authToken = 'test-token';
const testId = 'test-uuid-123';

describe('403 FORBIDDEN handling in get operations', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Entity get operations (return null on 403)', () => {
        test('getPagesById returns null on FORBIDDEN', async () => {
            mockRequest.mockRejectedValue(forbiddenError);
            const { getPagesById } = await import('../../../src/operations/pages/getPagesById');
            const result = await getPagesById(testId, endpoint, authToken);
            expect(result).toBeNull();
        });

        test('getPagesById throws on other errors', async () => {
            mockRequest.mockRejectedValue(otherError);
            const { getPagesById } = await import('../../../src/operations/pages/getPagesById');
            await expect(getPagesById(testId, endpoint, authToken)).rejects.toThrow();
        });

        test('getContentBlocksById returns null on FORBIDDEN', async () => {
            mockRequest.mockRejectedValue(forbiddenError);
            const { getContentBlocksById } = await import('../../../src/operations/contentBlocks/getContentBlocksById');
            const result = await getContentBlocksById(testId, endpoint, authToken);
            expect(result).toBeNull();
        });

        test('getContentBlocksById throws on other errors', async () => {
            mockRequest.mockRejectedValue(otherError);
            const { getContentBlocksById } = await import('../../../src/operations/contentBlocks/getContentBlocksById');
            await expect(getContentBlocksById(testId, endpoint, authToken)).rejects.toThrow();
        });

        test('getCardBlocksById returns null on FORBIDDEN', async () => {
            mockRequest.mockRejectedValue(forbiddenError);
            const { getCardBlocksById } = await import('../../../src/operations/cardBlocks/getCardBlocksById');
            const result = await getCardBlocksById(testId, endpoint, authToken);
            expect(result).toBeNull();
        });

        test('getTabBlocksById returns null on FORBIDDEN', async () => {
            mockRequest.mockRejectedValue(forbiddenError);
            const { getTabBlocksById } = await import('../../../src/operations/tabBlocks/getTabBlocksById');
            const result = await getTabBlocksById(testId, endpoint, authToken);
            expect(result).toBeNull();
        });

        test('getTabBlockLabelById returns null on FORBIDDEN', async () => {
            mockRequest.mockRejectedValue(forbiddenError);
            const { getTabBlockLabelById } = await import('../../../src/operations/tabBlocks/getTabBlockLabelById');
            const result = await getTabBlockLabelById(testId, endpoint);
            expect(result).toBeNull();
        });

        test('getExpansionPanelsById returns null on FORBIDDEN', async () => {
            mockRequest.mockRejectedValue(forbiddenError);
            const { getExpansionPanelsById } = await import('../../../src/operations/expansionPanels/getExpansionPanelsById');
            const result = await getExpansionPanelsById(testId, endpoint, authToken);
            expect(result).toBeNull();
        });

        test('getExpansionPanelBlockLabelById returns null on FORBIDDEN', async () => {
            mockRequest.mockRejectedValue(forbiddenError);
            const { getExpansionPanelBlockLabelById } = await import('../../../src/operations/expansionPanels/getExpansionPanelBlockLabelById');
            const result = await getExpansionPanelBlockLabelById(testId, endpoint);
            expect(result).toBeNull();
        });

        test('getCollectionBlocksById returns null on FORBIDDEN', async () => {
            mockRequest.mockRejectedValue(forbiddenError);
            const { getCollectionBlocksById } = await import('../../../src/operations/collectionBlocks/getCollectionBlocksById');
            const result = await getCollectionBlocksById(testId, endpoint, authToken);
            expect(result).toBeNull();
        });

        test('getCollectionBlocksById throws on other errors', async () => {
            mockRequest.mockRejectedValue(otherError);
            const { getCollectionBlocksById } = await import('../../../src/operations/collectionBlocks/getCollectionBlocksById');
            await expect(getCollectionBlocksById(testId, endpoint, authToken)).rejects.toThrow();
        });
    });

    describe('Junction table get operations (return [] on 403)', () => {
        test('getPagesPageBlocks returns [] on FORBIDDEN', async () => {
            mockRequest.mockRejectedValue(forbiddenError);
            const { getPagesPageBlocks } = await import('../../../src/operations/pages/getPagesPageBlocks');
            const result = await getPagesPageBlocks(testId, endpoint, authToken);
            expect(result).toEqual([]);
        });

        test('getPagesPageBlocks throws on other errors', async () => {
            mockRequest.mockRejectedValue(otherError);
            const { getPagesPageBlocks } = await import('../../../src/operations/pages/getPagesPageBlocks');
            await expect(getPagesPageBlocks(testId, endpoint, authToken)).rejects.toThrow();
        });

        test('getPagesSidebarBlocks returns [] on FORBIDDEN', async () => {
            mockRequest.mockRejectedValue(forbiddenError);
            const { getPagesSidebarBlocks } = await import('../../../src/operations/pages/getPagesSidebarBlocks');
            const result = await getPagesSidebarBlocks(testId, endpoint, authToken);
            expect(result).toEqual([]);
        });

        test('getCardBlocksCardContentBlocks returns [] on FORBIDDEN', async () => {
            mockRequest.mockRejectedValue(forbiddenError);
            const { getCardBlocksCardContentBlocks } = await import('../../../src/operations/cardBlocks/getCardBlocksCardContentBlocks');
            const result = await getCardBlocksCardContentBlocks(testId, endpoint, authToken);
            expect(result).toEqual([]);
        });

        test('getTabBlocksTabBlocks returns [] on FORBIDDEN', async () => {
            mockRequest.mockRejectedValue(forbiddenError);
            const { getTabBlocksTabBlocks } = await import('../../../src/operations/tabBlocks/getTabBlocksTabBlocks');
            const result = await getTabBlocksTabBlocks(testId, endpoint, authToken);
            expect(result).toEqual([]);
        });

        test('getExpansionPanelsExpansionPanelBlocks returns [] on FORBIDDEN', async () => {
            mockRequest.mockRejectedValue(forbiddenError);
            const { getExpansionPanelsExpansionPanelBlocks } = await import('../../../src/operations/expansionPanels/getExpansionPanelsExpansionPanelBlocks');
            const result = await getExpansionPanelsExpansionPanelBlocks(testId, endpoint, authToken);
            expect(result).toEqual([]);
        });

        test('getExpansionPanelsExpansionPanelBlocks throws on other errors', async () => {
            mockRequest.mockRejectedValue(otherError);
            const { getExpansionPanelsExpansionPanelBlocks } = await import('../../../src/operations/expansionPanels/getExpansionPanelsExpansionPanelBlocks');
            await expect(getExpansionPanelsExpansionPanelBlocks(testId, endpoint, authToken)).rejects.toThrow();
        });
    });
});

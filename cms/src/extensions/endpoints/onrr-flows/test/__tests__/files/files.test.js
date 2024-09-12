import { jest } from '@jest/globals';
import { getMocks } from '../../__setup__/files/files.setup';
import { ApiMessages } from '../../../src/constants';
const { runFiles: sut } = await import('../../../src/services/filesFlow');

let getDirectusFilesByUuid,
    uploadDirectusFile,
    updateDirectusFile,
    directusFile;

beforeAll(async () => {
    const mocks = await getMocks();
    getDirectusFilesByUuid = mocks.getDirectusFilesByUuid;
    uploadDirectusFile = mocks.uploadDirectusFile;
    updateDirectusFile = mocks.updateDirectusFile;
    directusFile = mocks.directusFile;
});

describe('Test files flow', () => {
    beforeEach(async() => {
        jest.resetAllMocks();
    });

    test('Returns array', async () => {
        // Arrange
        getDirectusFilesByUuid.mockResolvedValue(directusFile);

        // Act
        const results = await sut();
        
        // Assert
        expect(Array.isArray(results)).toBeTruthy();
        
    });

    test('Calls getDirectusFiles 2x', async () => {
        // Arrange
        getDirectusFilesByUuid.mockResolvedValue(directusFile);

        // Act
        await sut();

        // Assert
        expect(getDirectusFilesByUuid).toHaveBeenCalledTimes(2);
    });

    test('Calls uploadDirectusFile', async () => {
        // Arrange
        getDirectusFilesByUuid.mockResolvedValueOnce(directusFile)
            .mockResolvedValueOnce({});

        // Act
        await sut();

        // Assert
        expect(uploadDirectusFile).toHaveBeenCalled();

    });

    test('Calls updateDirectusFile', async () => {
        // Arrange
        var latest = JSON.parse(JSON.stringify(directusFile));
        latest.filesize = '65000';
        getDirectusFilesByUuid.mockResolvedValueOnce(latest)
            .mockResolvedValueOnce(directusFile);

        // Act
        await sut();

        // Assert
        expect(updateDirectusFile).toHaveBeenCalled();
    });

    test('Returns FILE_UPLOADED when file is new', async () => {
        // Arrange
        getDirectusFilesByUuid.mockResolvedValueOnce(directusFile)
            .mockResolvedValueOnce({});

        uploadDirectusFile.mockResolvedValueOnce(directusFile);

        // Act
        const result = await sut();

        // Assert
        expect(result.find(r => r.message === ApiMessages.FILE_UPLOADED)).toBeTruthy();
    });

    test('Returns FILE_UPDATED when file exists', async () => {
        // Arrange
        var latest = JSON.parse(JSON.stringify(directusFile));
        latest.filesize = '65000';
        getDirectusFilesByUuid.mockResolvedValueOnce(latest)
            .mockResolvedValueOnce(directusFile);

        // Act
        const result = await sut();

        // Assert
        expect(result.find(r => r.message === ApiMessages.FILE_UPDATED)).toBeTruthy();
    });
});
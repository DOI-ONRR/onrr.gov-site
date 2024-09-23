import { jest } from '@jest/globals';
import { directusFile } from '../../__mocks__/files/files.mocks';

jest.unstable_mockModule('../../../src/operations/files/getDirectusFilesByUuid', () => ({
    getDirectusFilesByUuid: jest.fn()
}));

jest.unstable_mockModule('../../../src/operations/files/uploadDirectusFile', () => ({
    uploadDirectusFile: jest.fn()
}));

jest.unstable_mockModule('../../../src/operations/files/updateDirectusFile', () => ({
    updateDirectusFile: jest.fn()
}));

export const getMocks = async () => {
    const { getDirectusFilesByUuid } = await import('../../../src/operations/files/getDirectusFilesByUuid');
    const { uploadDirectusFile } = await import('../../../src/operations/files/uploadDirectusFile');
    const { updateDirectusFile } = await import('../../../src/operations/files/updateDirectusFile');

    return {
        getDirectusFilesByUuid,
        uploadDirectusFile,
        updateDirectusFile,
        directusFile
    };
};
import { createDirectus, rest, staticToken, updateFile } from '@directus/sdk';
import { downloadFile } from './downloadFile';
import { UpstreamAuthToken, Endpoints } from '../../constants';
import { logger } from "../../utils";

export async function updateDirectusFile(file) {
    try {
        const client = createDirectus(Endpoints.UPSTREAM_CMS)
            .with(staticToken(UpstreamAuthToken))
            .with(rest());

        const fileUrl = `${Endpoints.LOCAL_CMS}/assets/${file.filename_disk}`;
        const filenameDownload = file.filename_download;

        delete file.filename_disk;
        delete file.filename_download;

        const formData = new FormData();
        Object.keys(file).forEach((key) => {
            formData.append(key, file[key]);
        });

        const fileBlob = await downloadFile(fileUrl);

        formData.append('file', fileBlob, filenameDownload);

        const result = await client.request(updateFile(file.id, formData));

        return result;
    } catch (error) {
        logger.error('Error in updateDirectusFile:\n', error);
        throw new Error('Error in updateDirectusFile');
    }
}
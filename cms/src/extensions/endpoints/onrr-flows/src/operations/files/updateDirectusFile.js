import { createDirectus, rest, staticToken, updateFile } from '@directus/sdk';
import { getFolderById } from './getFolderById';
import { downloadFile } from './downloadFile';
import { UpstreamAuthToken, Endpoints } from '../../constants';
import { logger } from "../../utils";

export async function updateDirectusFile(file) {
    try {
        const client = createDirectus(Endpoints.UPSTREAM_CMS)
            .with(staticToken(UpstreamAuthToken))
            .with(rest());

        delete file.filename_disk;
        delete file.filename_download;

        const formData = new FormData();
        Object.keys(file).forEach((key) => {
            formData.append(key, file[key]);
        });

        const folder = await getFolderById(file.folder);

        const fileUrl = `${Endpoints.LOCAL_CMS}/${folder.name}/${file.filename_download}`;

        const fileBlob = await downloadFile(fileUrl);

        formData.append('file', fileBlob, file.filename_download);

        const result = await client.request(updateFile(formData));

        return result;
    } catch (error) {
        logger.error('Error in updateDirectusFile:\n', error);
        throw new Error('Error in updateDirectusFile');
    }
}
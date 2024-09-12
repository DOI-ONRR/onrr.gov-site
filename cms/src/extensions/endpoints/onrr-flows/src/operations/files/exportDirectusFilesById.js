import { createDirectus, rest, utilsExport } from '@directus/sdk';
import { getFolderByName } from './getFolderByName';
const { v4: uuidv4 } = await import('uuid');
import { Endpoints } from '../../constants';
import { logger } from "../../utils";

export async function exportDirectusFilesById(uuid) {
    try {
        const folder = await getFolderByName('publish', Endpoints.LOCAL_CMS);
        const fileTitle = `publish-file-${uuidv4()}`;
        const client = createDirectus(Endpoints.LOCAL_CMS).with(rest());
        await client.request(
            utilsExport(
                'directus_files',
                'json',
                {
                    filter: {
                        id: {
                            _eq: uuid,
                        },
                    },
                },
                {
                    file: {
                        folder: folder.id,
                        title: fileTitle
                    },
                }
            )
        );
        return fileTitle;
    } catch (error) {
        logger.error('Error in exportDirectusFilesById:\n', error);
    }
}
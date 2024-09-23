import { createDirectus, rest, readFile } from '@directus/sdk';
import { logger } from "../../utils";

export async function getDirectusFilesByUuid(uuid, cmsUrl) {
    try {
        const client = createDirectus(cmsUrl).with(rest());

        const file = await client.request(
            readFile(uuid, {
                fields: ['*'],
            })
        );

        return file;
    } catch (error) {
        if (error.response && error.response.status === 403) {
            return {};
        }
        logger.error('Error in getDirectusFilesByUuid:\n', error);
        throw new Error('Error in getDirectusFilesByUuid');
    }
}
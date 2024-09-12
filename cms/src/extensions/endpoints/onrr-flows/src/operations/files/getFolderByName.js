import { createDirectus, rest, readFolders } from '@directus/sdk';
import { logger } from '../../utils';

export async function getFolderByName(name, cmsUrl) {
    try {
        const client = createDirectus(cmsUrl).with(rest());

        const result = await client.request(
            readFolders({
                filter: {
                    name: {
                        _eq: name
                    }
                }
            })
        );

        return result;
    } catch (error) {
        logger.error('Error in getFolderByName:', error);
        throw new Error('Error in getFolderByName');
    }
}
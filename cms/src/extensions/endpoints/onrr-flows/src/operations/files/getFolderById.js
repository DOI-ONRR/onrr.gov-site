import { createDirectus, rest, readFolders } from '@directus/sdk';
import { Endpoints } from '../../constants';
import { logger } from '../../utils';

export async function getFolderById(id) {
    try {
        const client = createDirectus(Endpoints.LOCAL_CMS).with(rest());

        const result = await client.request(
            readFolders({
                filter: {
                    id: {
                        _eq: id
                    }
                }
            })
        );

        return result.find(f => f.id === id);
    } catch (error) {
        logger.error('Error in getFolderById:', error);
        throw new Error('Error in getFolderById');
    }
}
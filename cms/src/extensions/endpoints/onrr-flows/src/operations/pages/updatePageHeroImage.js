import { logger } from "../../utils/logger";

export async function updatePageHeroImage(pageId, heroImageId, cmsUrl, authToken) {
    try {
        const response = await fetch(`${cmsUrl}/items/pages/${pageId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({ hero_image: heroImageId }),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Failed to update hero_image (${response.status}): ${errorBody}`);
        }

        const result = await response.json();
        return result.data?.id;
    } catch (error) {
        logger.error(`Error in updatePageHeroImage (${pageId}):`, error);
        throw new Error('Error in updatePageHeroImage');
    }
}

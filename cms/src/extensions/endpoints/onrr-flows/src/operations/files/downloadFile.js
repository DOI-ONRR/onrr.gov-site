import { logger } from "../../utils";
export async function downloadFile(fileUrl) {
    try {
        const response = await fetch(fileUrl);
        if (!response.ok) {
            throw new Error(`Failed to download ${fileUrl}: ${response.statusText}`);
        }
        const blob = await response.blob();
        return blob;
    } catch (error) {
        logger.error('Error in downloadFile:', error);
        throw new Error('Error in downloadFile');
    }
}
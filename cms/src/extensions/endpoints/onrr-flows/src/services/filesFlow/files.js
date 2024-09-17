import { logger } from "../../utils";
import { getDirectusFilesByUuid, uploadDirectusFile, updateDirectusFile } from "../../operations/files";
import { Endpoints, ApiMessages } from "../../constants";
import diff from "deep-diff";

export async function runFiles(fileUuid) {
    try {
        var appliedChanges = [];
        const latest = await getDirectusFilesByUuid(fileUuid, Endpoints.LOCAL_CMS);
        const previous = await getDirectusFilesByUuid(fileUuid, Endpoints.UPSTREAM_CMS);
        if (Object.keys(previous).length === 0) {
            const newFile = await uploadDirectusFile(latest);
            appliedChanges.push({
                message: ApiMessages.FILE_UPLOADED,
                file: newFile
            });
        } else {
            const changes = diff(previous, latest);
            if (changes) {
                const updatedFile = await updateDirectusFile(latest);
                appliedChanges.push({
                    message: ApiMessages.FILE_UPDATED,
                    file: updatedFile
                });
            }
        }
        return appliedChanges;
    } catch (error) {
        logger.error('Error in runFiles:\n', error);
        throw new Error('Error in runFiles');
    }
}
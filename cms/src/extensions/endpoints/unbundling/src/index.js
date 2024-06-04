import * as fileUtils from '../../../../utils/file-utils';

export default (router, { services, exceptions }) => {
    const { ItemsService } = services;
    const { ServiceUnavailableException } = exceptions;

    router.get("/:file", (req, res, next) => {
        const fileService = new ItemsService("directus_files", {
            schema: req.schema,
            accountability: req.accountability,
        });
        const file = req.params.file;

        fileService
            .readByQuery({
                fields: ["*"],
                filter: { filename_download: { _eq: file } },
            })
            .then(async (results) => {
                const filePath = `/tmp/${file}`;
                const hostName = req.hostname == 'localhost' ? 'localhost:8055' : req.hostname;
                const url = `${req.protocol}://${hostName}/assets/${results[0].id}`;

                await fileUtils.getFile(filePath, url);
                return res.sendFile(filePath);
            })
            .catch((error) => {
                return next(new ServiceUnavailableException(error.message));
            });
    });
};

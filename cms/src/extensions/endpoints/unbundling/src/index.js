import * as fileUtils from '../../../../utils/file-utils';

const targetUrl =
    process.env.NODE_ENV === "production"
        ? "https://dev-onrr-cms.app.cloud.gov"
        : "http://localhost:8055";

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
                const url = `/assets/${results[0].id}`;

                await fileUtils.getFile(filePath, `${targetUrl}${url}`);
                return res.sendFile(filePath);
            })
            .catch((error) => {
                return next(new ServiceUnavailableException(error.message));
            });
    });
};

import * as fileUtils from '../../../../utils/file-utils';

export default (router, { exceptions }) => {
    const { ServiceUnavailableException } = exceptions;

    router.get("/:file", (req, res, next) => {
        linkService
            .readByQuery({ fields: ["*"], filter: { date: { _eq: date } } })
            .then(async (results) => {
                const filePath = "/tmp/reporter_letter." + date;
                const url = "/assets/" + results[0].file;

                await fileUtils.getFile(filePath, `${targetUrl}${url}`);
                return res.sendFile(filePath);
            })
            .catch((error) => {
                return next(new ServiceUnavailableException(error.message));
            });
    });
};

import { pipeline } from 'node:stream/promises'

// Builds the GET /:file handler shared by the document, press-releases,
// reporter-letters and unbundling endpoints. The file is looked up by its
// filename_download and streamed straight from Directus storage through
// AssetsService, with the caller's accountability applied. The handler never
// makes an HTTP request, so request headers (Host / X-Forwarded-Host) can't
// steer it to another server. It also writes nothing to local disk.
export const serveFileByName = ({ services, getSchema }) => {
  const { FilesService, AssetsService } = services

  return async (req, res, next) => {
    try {
      const schema = await getSchema()
      const fileName = req.params.file

      const filesService = new FilesService({ schema, accountability: req.accountability })
      const files = await filesService.readByQuery({
        fields: ['id'],
        filter: { filename_download: { _eq: fileName } },
        limit: 1,
      })

      if (!files || files.length === 0) {
        return res.status(404).json({ errors: [{ message: `File not found: ${fileName}`, extensions: { code: 'NOT_FOUND' } }] })
      }

      const assetsService = new AssetsService({ schema, accountability: req.accountability })
      const { stream, file, stat } = await assetsService.getAsset(files[0].id)

      res.type(file.type || 'application/octet-stream')
      if (stat?.size) res.setHeader('Content-Length', stat.size)

      await pipeline(stream, res)
    } catch (error) {
      // Once bytes are on the wire we can't send an error response; drop the
      // connection so the client sees a truncated download, not a bogus 200.
      if (res.headersSent) return res.destroy(error)
      return next(error)
    }
  }
}

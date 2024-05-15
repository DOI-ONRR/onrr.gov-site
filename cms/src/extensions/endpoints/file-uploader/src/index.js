import { createDirectus, rest, uploadFiles, readFolders } from '@directus/sdk'
import Busboy from 'busboy'
import { File } from 'buffer'

const cmsUrl = process.env.PUBLIC_URL;

const client = createDirectus(cmsUrl).with(rest())

function handleFileUpload (req, res, next) {
  if (
    req.headers['content-type'] &&
    req.headers['content-type'].includes('multipart/form-data')
  ) {
    const busboy = Busboy({ headers: req.headers })
    let fileBuffer = null

    busboy.on('file', (name, file, info) => {
      const { filename, encoding, mimeType } = info
      fileBuffer = Buffer.alloc(0)

      file.on('data', data => {
        fileBuffer = Buffer.concat([fileBuffer, data])
      })

      file.on('end', () => {
        req.fileBuffer = fileBuffer
        req.fileMetadata = { filename, encoding, mimeType }
        next()
      })
    })

    req.pipe(busboy)
  } else {
    next()
  }
}

async function getFolderId() {
    const folder = await client.request(readFolders({
        fields: ['id'],
        filter: {
            name: {
                _eq : "Images"
            }
        }
    }));

    return folder[0].id;
}

export default router => {
  router.post('/', handleFileUpload, async (req, res) => {
    try {
        const folderId = await getFolderId();
        const formData = new FormData()

        const image = new File([req.fileBuffer], req.fileMetadata.filename, {
            type: req.fileMetadata.mimeType
        })
        formData.append('title', req.fileMetadata.filename);
        formData.append('type', req.fileMetadata.mimeType);
        formData.append('folder', folderId);
        formData.append('file', image);

        const uploadResult = await client.request(uploadFiles(formData))

        res.json({
            success: 1,
            file: {
                url: `${cmsUrl}/assets/${uploadResult.filename_disk}`
            }
        })
    }
    catch (err) {
        console.error(err);
        res.json({
            success: 0,
            file: {}
        });
    }
  })
}

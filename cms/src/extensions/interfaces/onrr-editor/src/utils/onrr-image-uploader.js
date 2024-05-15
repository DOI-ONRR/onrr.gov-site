/**
 * Modified version of https://github.com/editor-js/image/blob/master/src/uploader.js
 */

export default class Uploader {
	constructor({ config, onUpload, onError }) {
		this.config = config;
		this.onUpload = onUpload;
		this.onError = onError;
	}

	uploadSelectedFile({ onPreview }) {
		this.config.picker((file) => {
			if (file) {
				const response = {
					success: 1,
					file: {
						size: file.filesize,
						name: file.filename_download,
						title: file.title,
						extension: file.filename_download.split(".").pop(),
						fileId: file.id,
						fileURL: this.config.baseURL + "files/" + file.id,
						url: this.config.baseURL + "assets/" + file.id,
						height: file.height,
						width: file.width,
					},
				};
				onPreview(response.file.fileURL);
				this.onUpload(response);
			} else {
				this.onError({
					success: 0,
					message: "No file selected",
				});
			}
		});
	}
}

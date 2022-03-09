import ImageTool from "@editorjs/image";
import { make } from "../utils/dom"
import Uploader from "../editorjs-uploader";

/**
 * Patch allows custom uploader.
 * https://github.com/editor-js/image/blob/master/src/index.js
 */
export default class extends ImageTool {
	constructor(args) {
		super(args);

		console.log('ImageTool child class args -------> ', args)

		this._data = args.data;

		this.uploader = new Uploader({
			config: {
				...args.config,
				...this.config,
			},
			onUpload: (response) => this.onUpload(response),
			onError: (error) => this.uploadingFailed(error),
		});

		this.ui.nodes = {
			...this.ui.nodes,
			// this.ui.CSS.caption
			formInputWrapper: make('div', ['form-input-wrapper', this.ui.CSS.caption]),
			formInputWidth: make('div', ['input-wrapper', this.ui.CSS.caption]),
			formInputHeight: make('div', ['input-wrapper', this.ui.CSS.caption]),
			imgWidthLabel: make('label', [],{ for: 'imgWidthInput' }),
			imgWidthInput: make('input', [this.ui.api.styles.input], { id: 'imgWidthInput', name: 'imgWidthInput' }),
			attributesWrapper: make('div', ['attr-wrapper', this.ui.CSS.caption]),
			altTagWrapper: make('div', ['input-wrapper', this.ui.CSS.caption]),
			altTagLabel: make('label', [], { for: 'altTagInput' }),
			altTagInput: make('input', [this.ui.api.styles.input], { id: 'altTagInput', name: 'altTagInput' }),
			imgHeightLabel: make('label', [],{ for: 'imgHeightInput' }),
			imgHeightInput: make('input', [this.ui.api.styles.input], { id: 'imgHeightInput', name: 'imgHeightInput', readOnly: 'readOnly' })
		}

		this.ui.nodes.imgWidthLabel.innerText = 'Width';
		this.ui.nodes.altTagLabel.innerText = 'Alt Text';

		this.ui.nodes.imgHeightLabel.innerText = 'Height';
		

		this.ui.nodes.formInputWidth.appendChild(this.ui.nodes.imgWidthLabel);
		this.ui.nodes.formInputWidth.appendChild(this.ui.nodes.imgWidthInput);

		this.ui.nodes.formInputHeight.appendChild(this.ui.nodes.imgHeightLabel);
		this.ui.nodes.formInputHeight.appendChild(this.ui.nodes.imgHeightInput);

		this.ui.nodes.formInputWrapper.appendChild(this.ui.nodes.formInputWidth);
		this.ui.nodes.formInputWrapper.appendChild(this.ui.nodes.formInputHeight);

		this.ui.nodes.altTagWrapper.appendChild(this.ui.nodes.altTagLabel);
		this.ui.nodes.altTagWrapper.appendChild(this.ui.nodes.altTagInput);

		this.ui.nodes.attributesWrapper.appendChild(this.ui.nodes.altTagWrapper);

		this.ui.nodes.wrapper.appendChild(this.ui.nodes.attributesWrapper);
		this.ui.nodes.wrapper.appendChild(this.ui.nodes.formInputWrapper);
		

		this.ui.nodes.imgWidthInput.value = this._data?.imgWidth || this._data?.file?.width || '';
		this.ui.nodes.imgHeightInput.value = this._data?.imgHeight || this._data?.file?.height || '';
		this.ui.nodes.altTagInput.value = this._data?.altTag || '';
		this.ui.nodes.altTagInput.addEventListener('change', (e) => {
                  console.debug(e);
                  this.save();
		});

		this.ui.nodes.imgWidthInput.addEventListener('change', (e) => {
			if (e.target.value !== this._data?.file?.width && e.target.value !== '') {
				this.ui.nodes.imgHeightInput.value = getImageHeight(this._data.file.height, this._data.file.width, e.target.value);
			}
			this.save();
		});
	}

	set image(file) {
		this._data.file = file || {};
		if (file && file.url) {
			const imageUrl = this.config.uploader.addTokenToURL(file.url) + "&withoutEnlargement";
			this.ui.fillImage(imageUrl);
		}
	}


	render() {
		const renderResult = super.render();
		return renderResult;
	}

	save() {
		const saveResult = super.save();

		const altTag = this.ui.nodes.altTagInput;
		const imgWidth = this.ui.nodes.imgWidthInput;
		const imgHeight = this.ui.nodes.imgHeightInput;

		this._data.altTag = altTag.value;
		this._data.imgWidth = imgWidth.value;
		this._data.imgHeight = imgHeight.value;

		// console.log('saveResult ------> ', super.save());

		return saveResult;
	}

}



/**
 * 
 * @param orginalHeight | orignial height of image
 * @param originalWidth | original width of image
 * @param newWidth | new width of image
 */
function getImageHeight(originalHeight, originalWidth, newWidth) {
	return Math.round((originalHeight / originalWidth) * newWidth);
}

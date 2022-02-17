import ImageTool from "@editorjs/image";
import Uploader from "../editorjs-uploader";

/**
 * Patch allows custom uploader.
 * https://github.com/editor-js/image/blob/master/src/index.js
 */
export default class extends ImageTool {
	constructor(args) {
		super(args);

		console.log('export default class extends ImageTool this yo ------> ', this)

		this._data = args.data

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

		this.ui.nodes.altTagInput.value = this.data?.altTag || '';
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
		

		this.ui.nodes.imgWidthInput.value = this._data?.file?.width || '';
		this.ui.nodes.imgHeightInput.value = this._data?.file?.height || '';
		this.ui.nodes.altTagInput.value = this._data?.altTag || '';

		this.ui.nodes.imgWidthInput.addEventListener('change', (e) => {
			if (e.target.value !== this._data?.file?.width) {
				this.ui.nodes.imgHeightInput.value = getImageHeight(this._data.file.height, this._data.file.width, e.target.value)
			}
			this.save();
		});

		// this.ui.nodes.imgHeightInput.addEventListener('change', (e) => {
		// 	this.save();
		// 	if (e.target.value !== this._data?.file?.height && e.target.value !== 'auto') {
		// 		this.ui.nodes.imgWidthInput.value = 'auto'
		// 	}
		// });
		

		this.ui.nodes.altTagInput.addEventListener('change', () => {
			this.save();
		})

	}

	set image(file) {
		this._data.file = file || {};
		if (file && file.url) {
			const imageUrl =
				this.config.uploader.addTokenToURL(file.url) +
				"&withoutEnlargement";
			this.ui.fillImage(imageUrl);
		}
	}

	save() {
		const saveResult = super.save()

		const imgWidth = this.ui.nodes.imgWidthInput;
		const imgHeight = this.ui.nodes.imgHeightInput;
		const altTag = this.ui.nodes.altTagInput;

		this._data.imgWidth = imgWidth.value;
		this._data.imgHeight = imgHeight.value;
		this._data.altTag = altTag.value;

		console.log('save result super.save yo ------> ', saveResult)
	
		return Object.assign(this.data, saveResult);
	}

}

/**
 * Helper for making Elements with attributes
 *
 * @param  {string} tagName           - new Element tag name
 * @param  {Array|string} classNames  - list or name of CSS class
 * @param  {object} attributes        - any attributes
 * @returns {Element}
 */
export const make = function make(tagName, classNames = null, attributes = {}) {
  const el = document.createElement(tagName);

  if (Array.isArray(classNames)) {
    el.classList.add(...classNames);
  } else if (classNames) {
    el.classList.add(classNames);
  }

  for (const attrName in attributes) {
    el[attrName] = attributes[attrName];
  }

  return el;
};


/**
 * 
 * @param orginalHeight | orignial height of image
 * @param originalWidth | original width of image
 * @param newWidth | new width of image
 */
function getImageHeight(originalHeight, originalWidth, newWidth) {
	return Math.round((originalHeight / originalWidth) * newWidth);
}
/**
 * Height based on their natural width and height to maintain the aspect ratio.
 * Works best for 1:1 aspect ratio but can be modified to accommodate other ratio.
 * 
 * @param Element|Resource img - An image element/resource from DOM
 * @param int expected - Expected width or height
 */
 
// function setAspectRatio(img, expected) {
    
// 		// No support for IE8 and lower
// 		if ( img.naturalWidth === 'undefined' ) return;
		
// 		// Get natural dimensions of image
// 		var width = img.naturalWidth;
// 		var height = img.naturalHeight;
		
// 		// Examine if width is larger than height then reduce the width but fix the height
// 		if ( width > height ) {
// 			img.style.width = (width / height * expected) + 'px';
// 			img.style.height = expected + 'px';
			
// 			// horizontally center the image
// 			img.style.transform = 'translatex(-' + parseInt((width / height * expected) - expected) + 'px)';
// 			img.style.webkitTransform = 'translateX(-' + parseInt((width / height * expected) - expected) + 'px)';
// 			return img;
// 		}
		
// 		// Examine if height is larger than width then reduce the height but fix the width
// 		else if ( height > width ) {
// 			img.style.width = expected + 'px';
// 			img.style.height = (height / width * expected) + 'px';
			
// 			// vertically center the image
// 			img.style.transform = 'translateY(-' + parseInt((height / width * expected) - expected) + 'px)';
// 			img.style.webkitTransform = 'translateY(-' + parseInt((height / width * expected) - expected) + 'px)';
// 			return img;
// 		}
		
// 		// Or return fix width and height
// 		else {
// 			img.style.width = expected + 'px';
// 			img.style.height = expected + 'px';
// 		}
// }

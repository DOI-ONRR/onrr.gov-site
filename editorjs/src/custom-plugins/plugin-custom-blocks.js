import { make } from "../utils/dom"

export default class CustomBlocksTool {

  constructor({ data, config, api }) {

    console.info('constructor data ---------> ', data)

    // this.data = {
    //   customBlock: "contacts_search_results"
    // }

    this.data = {
      customBlock: data.customBlock || '',
    };

    this.api = api;
    this.config = config || {};

     /**
      * Styles
      */
     this.CSS = {
       baseClass: this.api.styles.block,
       loading: this.api.styles.loader,
       input: this.api.styles.input,
       settingsButton: this.api.styles.settingsButton,
       settingsButtonActive: this.api.styles.settingsButtonActive,
       button: this.api.styles.button,
 
       /**
        * Tool's classes
        */
       wrapper: 'cdx-collection',
     };

    this.nodes = {
      wrapper: null,
      selectInput: null,
      selectOptions: null,
    };

    setTimeout(() => {
      // console.log('data yo after 3 seconds ---------> ', data);
    }, 5000);
    
  }

  static get toolbox() {
    return {
      title: 'Custom Blocks',
      icon: '<svg width="20" height="20" viewBox="0 0 24 24"><path d="M21,16.5C21,16.88 20.79,17.21 20.47,17.38L12.57,21.82C12.41,21.94 12.21,22 12,22C11.79,22 11.59,21.94 11.43,21.82L3.53,17.38C3.21,17.21 3,16.88 3,16.5V7.5C3,7.12 3.21,6.79 3.53,6.62L11.43,2.18C11.59,2.06 11.79,2 12,2C12.21,2 12.41,2.06 12.57,2.18L20.47,6.62C20.79,6.79 21,7.12 21,7.5V16.5M12,4.15L6.04,7.5L12,10.85L17.96,7.5L12,4.15M5,15.91L11,19.29V12.58L5,9.21V15.91M19,15.91V9.21L13,12.58V19.29L19,15.91Z"></path></svg>'
    }
  }

  render() {
    // console.log('render this.data ----------> ', this.data)
    const wrapper = make('div', [this.CSS.wrapper]),
      selectInputLabel = make('label'),
      selectInput = make('select', [this.CSS.input]),
      contentBox = make('div');


    let selectOption = make('option');
    const selectOptions = [
      {
        text: 'Choose one',
        value: '',
      },
      {
        text: 'Contacts Search',
        value: 'contacts_search',
      },
      { 
        text: 'Contacts Search Results',
        value: 'contacts_search_results'
      }
    ];


    
    selectInput.id = 'customBlocksSelector'
    selectInputLabel.innerHTML = 'Custom Block';
    selectInputLabel.setAttribute('for', 'customBlocksSelector');
    
    selectOptions.forEach(item => {
      selectOption = make('option')
      selectOption.value = item.value;
      selectOption.text = item.text;
      selectInput.appendChild(selectOption);
    });

    selectInput.addEventListener("change", (e) => {
      // do something on change event
      console.log('selectInput e ------> ', e)
      this.data.customBlock = e.target.value;
    });

    wrapper.appendChild(selectInput);

    if (this.data && this.data.customBlock) {
      const foundIndex = Array.from(selectInput.options).findIndex(item => item.value === this.data.customBlock);
      selectInput.options[foundIndex || 0].selected = true;

      contentBox.style.padding = '10px';
      contentBox.style.border = '5px dashed #00c897';
      contentBox.style.textAlign = 'center';
      contentBox.style.margin = '10px 0';
      contentBox.style.width = '100%';
      contentBox.innerHTML =  this.data.customBlock 

      wrapper.appendChild(contentBox);
    }

    wrapper.style.margin = '10px 0';
    wrapper.style.display = 'flex';
    wrapper.style.justifyContent = 'flex-start';
    wrapper.style.flexBasis = '100%';
    wrapper.style.flexWrap = 'wrap';

    return wrapper;
  }

  save(blockContent) {
    // console.log('blockContent: ', blockContent);
    const customBlock = blockContent.querySelector('#customBlocksSelector');

    if (!customBlock) {
      return this.data;
    }

    return Object.assign(this.data, {
      customBlock: customBlock.value
    });
  }

  /**
   * Notify core that read-only mode is suppoorted
   *
   * @returns {boolean}
   */
  static get isReadOnlySupported() {
    return true;
  }

}
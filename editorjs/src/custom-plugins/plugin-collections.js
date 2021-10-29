export default class CollectionsTool {

  constructor({ data, config, api }) {

    // this.data = {
    //   "collection": "announcements",
    //   "layout": "basic",
    //   "fields": [
    //       {
    //           "field": "id",
    //           "type": "integer"
    //       },
    //       {
    //           "field": "status",
    //           "type": "string"
    //       },
    //       {
    //           "field": "sort",
    //           "type": "integer"
    //       },
    //       {
    //           "field": "user_created",
    //           "type": "uuid"
    //       },
    //       {
    //           "field": "date_created",
    //           "type": "timestamp"
    //       },
    //       {
    //           "field": "user_updated",
    //           "type": "uuid"
    //       },
    //       {
    //           "field": "date_updated",
    //           "type": "timestamp"
    //       },
    //       {
    //           "field": "title",
    //           "type": "string"
    //       },
    //       {
    //           "field": "content",
    //           "type": "text"
    //       },
    //       {
    //           "field": "published_on",
    //           "type": "timestamp"
    //       }
    //   ]
    // }

    this.data = {
      collection: data.collection || '',
      fields: data.fields || [],
      layout: data.layout || ''
    };

    this.api = api;
    this.config = config || {};

    this.collectionsEndpoint = this.config.collectionsEndpoint;
    this.fieldsEndpoint = this.config.fieldsEndpoint;

     /**
      * Styles
      */
     this.CSS = {
       baseClass: this.api.styles.block,
       loading: this.api.styles.loader,
       input: this.api.styles.input,
       settingsButton: this.api.styles.settingsButton,
       settingsButtonActive: this.api.styles.settingsButtonActive,
 
       /**
        * Tool's classes
        */
       wrapper: 'cdx-collection',
     };

    this.nodes = {
      wrapper: null,
      selectInput: null,
      selectOptions: null,
      collectionItems: null,
    };

    // console.log('this.data yo ---------> ', this.data)

    // setTimeout(() => {
    //   console.log('this.data yo after 3 seconds ---------> ', this.data)
    // }, 3000);
    
  }

  static get toolbox() {
    return {
      title: 'Collections',
      icon: '<svg width="20" height="20" viewBox="0 0 22 22"><path d="M4 18H13L11 20H4C3.5 20 2.97 19.79 2.59 19.41C2.21 19.03 2 18.5 2 18V8H4V18M17.63 4.84C17.27 4.33 16.67 4 16 4H8C6.9 4 6 4.9 6 6V14C6 15.1 6.9 16 8 16H16C16.67 16 17.27 15.66 17.63 15.15L22 10L17.63 4.84M16 14H8V6H16L19.55 10Z"></path></svg>'
    }
  }

  render() {
    // console.log('render this.data ----------> ', this.data)
    const wrapper = this._make('div', [this.CSS.wrapper]),
      selectInput = this._make('select', [this.CSS.input]),
      selectLayoutInput = this._make('select', [this.CSS.input]),
      collectionBox = this._make('div');


    const layoutOptions = [
      {
        text: 'Basic',
        value: 'basic',
      },
      {
        text: 'Full',
        value: 'full',
      },
    ]

    let selectOption = this._make('option');
    let selectLayoutOption = this._make('option');

    selectInput.id = 'collectionsSelector';
    selectOption.value = this.data && this.data.collection ? this.data.collection : '';
    selectOption.text = this.data && this.data.collection ? this.data.collection : 'Choose one';
    selectInput.appendChild(selectOption);

    selectInput.style.width = '48%';
    

    selectLayoutInput.id = 'collectionsLayoutSelector';
    layoutOptions.forEach(item => {
      selectLayoutOption = this._make('option')
      selectLayoutOption.value = item.value;
      selectLayoutOption.text = item.text;
      selectLayoutInput.appendChild(selectLayoutOption);
    });

    if (this.data && this.data.layout) {
      const foundIndex = Array.from(selectLayoutInput.options).findIndex(item => item.value === this.data.layout)
      selectLayoutInput.options[foundIndex || 0].selected = true
    }

    selectLayoutInput.style.width = '48%';
    

    
    if (this.data && this.data.collection && this.data.layout) {
      collectionBox.style.padding = '10px';
      collectionBox.style.border = '5px dashed #00c897';
      collectionBox.style.textAlign = 'center';
      collectionBox.style.margin = '10px 0';
      collectionBox.style.width = '100%';
      collectionBox.innerHTML = `${ this.data.collection } -- ${ this.data.layout } layout`;
    }

    selectInput.addEventListener("change", () => {
      this.fetchFields(selectInput.value, selectLayoutInput.value);
    });

    selectLayoutInput.addEventListener("change", () => {
      this.fetchFields(selectInput.value, selectLayoutInput.value);
    });

    this.fetchCollections().then(collections => {
      collections.forEach((item, i) => {
        // console.log('item: ', item);

        // let str = collections[i].replace(/_/g, ' ');

        selectOption = this._make('option')
        selectOption.value = collections[i];
        selectOption.text = collections[i].replace(/_/g, ' ');
        selectInput.appendChild(selectOption)
      });
    })


    wrapper.appendChild(selectInput);
    wrapper.appendChild(selectLayoutInput);

    if (this.data && this.data.collection && this.data.layout) {
      wrapper.appendChild(collectionBox);
    }
    wrapper.style.margin = '10px 0';
    wrapper.style.display = 'flex';
    wrapper.style.justifyContent = 'space-between';
    wrapper.style.flexBasis = '100%';
    wrapper.style.flexWrap = 'wrap';

    return wrapper;
  }

  save(blockContent) {
    const select = blockContent.querySelector('#collectionsSelector');
    const selectLayout = blockContent.querySelector('#collectionsLayoutSelector');

    // console.log('save select ------> ', select.value, selectLayout.value);

    if (!select) {
      return this.data;
    }

    return Object.assign(this.data, {
      collection: select.value,
      layout: selectLayout.value,
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

  /**
 * Helper for making Elements with attributes
 *
 * @param  {string} tagName           - new Element tag name
 * @param  {Array|string} classNames  - list or name of CSS classname(s)
 * @param  {object} attributes        - any attributes
 * @returns {Element}
 */
  _make(tagName, classNames = null, attributes = {}) {
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
  }

  /**
   *
   * @collection {string}
   */
  async fetchFields(collection, layout) {
    try {
      const response = await fetch(`${ this.fieldsEndpoint }`);
      const collectionItems = await response.json();
      let fields = []
  
      const items = collectionItems.data
      items.filter(item => {
        if(item.collection === collection) {
          fields.push({ field: item.field, type: item.type })
        }
      })

      this.data.collection = collection;
      this.data.fields = fields;
      this.data.layout = layout;
   
      // waits until the request completes...
      // console.log('response from api yo -----> ', collection, fields, items);

    } catch(err){
      console.error(err);
    }
    
  }

  async fetchCollections() {

    const cItems = ['announcements', 'companies', 'contacts', 'events', 'press_releases', 'reporter_letters'];
    let nArr = []
    
    try {
      const collectionsResponse = await fetch(`${ this.collectionsEndpoint }`);
      const collections = await collectionsResponse.json();
  
      collections.data.map(item => {
        if (cItems.includes(item.collection)) {
          nArr.push(item.collection)
        }
      })

      return nArr
      
    } catch(err){
      console.error(err);
    }
    
  }


}

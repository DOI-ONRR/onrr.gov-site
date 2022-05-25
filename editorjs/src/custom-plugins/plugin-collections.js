export default class CollectionsTool {

  constructor({ data, config, api }) {

    console.info('data :: ', data)

    // this.data = {
    //   "collection": "reporter_letters",
    //   "layout": "basic",
    //   "fields": [],
    //   "page": "",
    //   "tab": "",
    //   "accordion": "",
    //   "status": "published",
    //   "topics": [
    //     "Oil &amp; Gas Production"
    //   ]
    // }

    this.data = {
      collection: data.collection || '',
      layout: data.layout || '',
      fields: data.fields || [],
      page: data.page || '',
      tab: data.tab || '',
      accordion: data.accordion || '',
      status: data.status || '',
      topics: data.topics || [],
    };


    // console.log('this.data --------> ', this.data)

    this.api = api;
    this.config = config || {};

    this.collectionsEndpoint = config.collectionsEndpoint;
    this.fieldsEndpoint = config.fieldsEndpoint;
    this.contactsEndpoint = config.contactsEndpoint;
    this.reporterLettersTopicsEndpoint = config.reporterLettersTopicsEndpoint

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
      collectionItems: null,
      button: null,
    };

    setTimeout(() => {
      // console.log('data yo after 3 seconds ---------> ', data);
    }, 5000);
    
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
      selectInputLabel = this._make('label'),
      selectInput = this._make('select', [this.CSS.input]),
      selectLayoutInputLabel = this._make('label'),
      selectLayoutInput = this._make('select', [this.CSS.input]),
      selectStatusInputLabel = this._make('label'),
      selectStatusInput = this._make('select', [this.CSS.input]),
      selectFieldsCol1 = this._make('div', [this.CSS.baseClass]),
      selectFieldsCol2 = this._make('div', [this.CSS.baseClass]),
      selectFieldsCol3 = this._make('div', [this.CSS.baseClass]),
      selectFieldsCol4 = this._make('div', [this.CSS.baseClass]),
      selectFieldsCol5 = this._make('div', [this.CSS.baseClass]),
      selectFieldsCol6 = this._make('div', [this.CSS.baseClass]),
      selectFieldsCol7 = this._make('div', [this.CSS.baseClass]),
      selectPageInput = this._make('select', [this.CSS.input]),
      selectPageInputLabel = this._make('label'),
      selectTabInput = this._make('select', [this.CSS.input]),
      selectTabInputLabel = this._make('label'),
      selectAccordionInput = this._make('select', [this.CSS.input]),
      selectAccordionInputLabel = this._make('label'),
      selectTopicInput = this._make('select',[this.CSS.input]),
      selectTopicLabel = this._make('label'),
      addCollectionButton = this._make('button', [this.CSS.button]),
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
    ];

    const statusOptions = [
      {
        text: 'Published',
        value: 'published',
      },
      {
        text: 'Archived',
        value: 'archived',
      },
    ];


    // set options
    let selectOption = this._make('option');
    let selectLayoutOption = this._make('option');
    let selectStatusOption = this._make('option');
    let selectPageOption = this._make('option');
    let selectTabOption = this._make('option');
    let selectAccordionOption = this._make('option');
    let selectTopicOption = this._make('option');

    // labels
    selectInputLabel.innerHTML = 'Collection';
    selectInputLabel.setAttribute('for', 'collectionsSelector');

    selectLayoutInputLabel.innerHTML = 'Layout';
    selectLayoutInputLabel.setAttribute('for', 'collectionsLayoutSelector');
    
    selectStatusInputLabel.innerHTML = 'Status';
    selectStatusInputLabel.setAttribute('for', 'collectionsStatusSelector');

    selectPageInputLabel.innerHTML = 'Page';
    selectPageInputLabel.setAttribute('for', 'collectionsPageSelector');

    selectTabInputLabel.innerHTML = 'Tab';
    selectTabInputLabel.setAttribute('for', 'collectionsTabSelector');

    selectAccordionInputLabel.innerHTML = 'Accordion';
    selectAccordionInputLabel.setAttribute('for', 'collectionsAccordionSelector');

    selectTopicLabel.innerHTML = 'Topics';
    selectTopicLabel.setAttribute('for', 'collectionsTopicSelector');

    selectTopicInput.setAttribute('multiple', true);

    selectInput.id = 'collectionsSelector';
    selectOption.value = '';
    selectOption.text = 'Choose one';
    selectInput.appendChild(selectOption);

    addCollectionButton.innerHTML = 'Add Collection';

    // addCollectionButton.addEventListener('click', () => {
    //   this.config.openCollectionsModal().then(something => {
    //     console.log('do something -----> ', something);
    //   })
    // });
   

    this.fetchCollections().then(collections => {
      console.log('fetchCollections collection: ', collections)
      collections.forEach((item, i) => {
        // console.log('item: ', item);

        selectOption = this._make('option');
        selectOption.value = collections[i];
        selectOption.text = collections[i].replace(/_/g, ' ');
        selectInput.appendChild(selectOption);
      });

      if (this.data && this.data.collection) {
        const foundIndex = Array.from(selectInput.options).findIndex(item => item.value === this.data.collection)
        selectInput.options[foundIndex || 0].selected = true
      }

    });

    this.fetchReportersLetterTopcis().then(topics => {
      topics.forEach(topic => {
        // console.log('topic -----> ', topic);
        selectTopicOption = this._make('option');
        selectTopicOption.value = topic;
        selectTopicOption.text = topic;
        selectTopicInput.appendChild(selectTopicOption);
      });

      // if (this.data && this.data.topics.length > 0) {
      //   this.data.topics.forEach(v => {
      //     Array.from(selectTopicInput.options).find(o => o.value == v).selected = true;
      //   });
      // }
    });

     // Page, tab, accordion fields
    selectPageInput.id = 'collectionsPageSelector';
    selectPageOption.value = '';
    selectPageOption.text = 'Choose one';
    selectPageInput.appendChild(selectPageOption);

    selectTabInput.id = 'collectionsTabSelector';
    selectTabOption.value = '';
    selectTabOption.text = 'Choose one';
    selectTabInput.appendChild(selectTabOption);

    selectAccordionInput.id = 'collectionsAccordionSelector';
    selectAccordionOption.value = '';
    selectAccordionOption.text = 'Choose one';
    selectAccordionInput.appendChild(selectAccordionOption);

    selectTopicInput.id = 'collectionsTopicSelector';

    this.fetchContacts().then(categories => {
      console.log('fetchContacts categories -----> ', categories);
      this.fetchFields(this.data);

      categories[0].sort().forEach(item => {
        // console.log('pages.forEach item ---------> ', item);
        selectPageOption = this._make('option')
        selectPageOption.value = item;
        selectPageOption.text = item;
        selectPageInput.appendChild(selectPageOption);
      });

      categories[1].sort().forEach(item => {
        // console.log('pages.forEach item ---------> ', item);
        selectTabOption = this._make('option')
        selectTabOption.value = item;
        selectTabOption.text = item;
        selectTabInput.appendChild(selectTabOption);
      });

      categories[2].sort().forEach(item => {
        // console.log('pages.forEach item ---------> ', item);
        selectAccordionOption = this._make('option')
        selectAccordionOption.value = item;
        selectAccordionOption.text = item;
        selectAccordionInput.appendChild(selectAccordionOption);
      });


      if (this.data && this.data.collection) {
        if (this.data.page) {
          const page = this.data.page.replace('&amp;', '&');
          const foundIndex = Array.from(selectPageInput.options).findIndex(item => item.value === page);
          selectPageInput.options[foundIndex || 0].selected = true;
        }

        if (this.data.tab) {
          const tab = this.data.tab.replace('&amp;', '&');
          const foundIndex = Array.from(selectTabInput.options).findIndex(item => item.value === tab);
          selectTabInput.options[foundIndex || 0].selected = true;
        }

        if (this.data.accordion) {
          const accordion = this.data.accordion.replace('&amp;', '&');
          const foundIndex = Array.from(selectAccordionInput.options).findIndex(item => item.value === accordion);
          selectAccordionInput.options[foundIndex || 0].selected = true;
        }

        if (this.data.topics && this.data.topics.length > 0) {
          this.data.topics.forEach(topic => {
            let t = topic.replace('&amp;', '&');
            Array.from(selectTopicInput.options).find(o => o.value == t).selected = true;
          });
        }
      }
    });


    selectLayoutInput.id = 'collectionsLayoutSelector';
    layoutOptions.forEach(item => {
      selectLayoutOption = this._make('option')
      selectLayoutOption.value = item.value;
      selectLayoutOption.text = item.text;
      selectLayoutInput.appendChild(selectLayoutOption);
    });


    selectStatusInput.id = 'collectionsStatusSelector';
    statusOptions.forEach(item => {
      selectStatusOption = this._make('option')
      selectStatusOption.value = item.value;
      selectStatusOption.text = item.text;
      selectStatusInput.appendChild(selectStatusOption);
    });

    

    if (this.data && this.data.layout) {
      const foundIndex = Array.from(selectLayoutInput.options).findIndex(item => item.value === this.data.layout)
      selectLayoutInput.options[foundIndex || 0].selected = true
    }

    if (this.data && this.data.status) {
      const foundIndex = Array.from(selectStatusInput.options).findIndex(item => item.value === this.data.status)
      selectStatusInput.options[foundIndex || 0].selected = true
    }

    selectInput.addEventListener("change", (e) => {
      this.fetchFields(this.data);

      if (e.target.value === 'press_releases' || e.target.value === 'reporter_letters') {
        selectFieldsCol2.style.display = 'block';
        selectFieldsCol4.style.display = 'none';
        if (e.target.value === 'press_releases') {
          selectFieldsCol7.style.display = 'none';
        }
        
        if (e.target.value === 'reporter_letters') {
          selectFieldsCol7.style.display = 'block';
        }
      } else if (selectInput.value === 'contacts') {
        selectFieldsCol4.style.display = 'block';
        selectFieldsCol5.style.display = 'block';
        selectFieldsCol6.style.display = 'block';
      } else {
        selectFieldsCol2.style.display = 'none';
        selectFieldsCol4.style.display = 'none';
        selectFieldsCol5.style.display = 'none';
        selectFieldsCol6.style.display = 'none';
        selectFieldsCol7.style.display = 'none';
      }
    });

    selectInput.addEventListener("change", (e) => {
      this.data.collection = e.target.value;
    })

    selectLayoutInput.addEventListener("change", (e) => {
      this.data.layout = e.target.value;
    });

    selectStatusInput.addEventListener("change", (e) => {
      this.data.status = e.target.value;
    });

    selectPageInput.addEventListener("change", (e) => {
      this.data.page = e.target.value;
    });

    selectTabInput.addEventListener("change", (e) => {
      this.data.tab = e.target.value;
    });

    selectAccordionInput.addEventListener("change", (e) => {
      this.data.accordion = e.target.value;
    })

    selectTopicInput.addEventListener("change", (e) => {
      // console.log('selectTopicInput change: ', e)
      const selectedOptions = [];
      Array.from(e.target).forEach(option => {
        if (option.selected) {
          selectedOptions.push(option.value);
        }
      })
      // console.log('selectedOptions -------> ', selectedOptions);
      this.data.topics = selectedOptions;
    })

    if (this.data && this.data.collection) {
      collectionBox.style.padding = '10px';
      collectionBox.style.border = '5px dashed #00c897';
      collectionBox.style.textAlign = 'center';
      collectionBox.style.margin = '10px 0';
      collectionBox.style.width = '100%';
      collectionBox.innerHTML = `${ this.data.collection } -- ${ this.data.status }`;

      if (this.data.collection === 'contacts') {
        collectionBox.innerHTML = `${ this.data.collection } 
        -- ${ this.data.status } 
        -- ${ this.data.page } 
        -- ${ this.data.tab }
        -- ${ this.data.accordion }
        -- ${ this.data.layout }`;
      }

      if (this.data.collection === 'reporter_letters') {
        collectionBox.innerHTML = `${ this.data.collection } 
        -- ${ this.data.status } 
        -- ${ this.data.layout }
        -- ${ this.data.topics.join(', ')}`;
      }

      if (this.data.collection === 'press_releases') {
        collectionBox.innerHTML = `${ this.data.collection } 
        -- ${ this.data.status } 
        -- ${ this.data.layout }`;
      }

      if (this.data.collection !== 'contacts' || this.data.collection !== 'reporter_letters' || this.data.collection !== 'press_releases') {
        `${ this.data.collection } 
        -- ${ this.data.status }`
      }
      
    }


    if (this.data && this.data.collection === 'contacts') {
      selectFieldsCol4.style.display = 'block';
      selectFieldsCol5.style.display = 'block';
      selectFieldsCol6.style.display = 'block';
    } else {
      selectFieldsCol4.style.display = 'none';
      selectFieldsCol5.style.display = 'none';
      selectFieldsCol6.style.display = 'none';
    }
    

    selectFieldsCol1.style.marginRight = '8px';
    selectFieldsCol2.style.marginRight = '8px';
    selectFieldsCol2.style.display = 'none';
    selectFieldsCol3.style.marginRight = '8px';
    selectFieldsCol4.style.marginRight = '8px';
    selectFieldsCol5.style.marginRight = '8px';
    selectFieldsCol6.style.marginRight = '8px';
    selectFieldsCol7.style.marginRight = '8px';
    selectFieldsCol7.style.display = (this.data && this.data.collection === 'reporter_letters') ? 'block' : 'none';


    selectFieldsCol1.appendChild(selectInputLabel);
    selectFieldsCol1.appendChild(selectInput);
    selectFieldsCol2.appendChild(selectLayoutInputLabel);
    selectFieldsCol2.appendChild(selectLayoutInput);
    selectFieldsCol3.appendChild(selectStatusInputLabel);
    selectFieldsCol3.appendChild(selectStatusInput);
    selectFieldsCol4.appendChild(selectPageInputLabel);
    selectFieldsCol4.appendChild(selectPageInput);
    selectFieldsCol5.appendChild(selectTabInputLabel);
    selectFieldsCol5.appendChild(selectTabInput);
    selectFieldsCol6.appendChild(selectAccordionInputLabel);
    selectFieldsCol6.appendChild(selectAccordionInput);
    selectFieldsCol7.appendChild(selectTopicLabel);
    selectFieldsCol7.appendChild(selectTopicInput);

    // wrapper.appendChild(addCollectionButton);
    wrapper.appendChild(selectFieldsCol1);
    wrapper.appendChild(selectFieldsCol2);
    wrapper.appendChild(selectFieldsCol4);
    wrapper.appendChild(selectFieldsCol5);
    wrapper.appendChild(selectFieldsCol6);
    wrapper.appendChild(selectFieldsCol7);
    wrapper.appendChild(selectFieldsCol3);

    if (this.data && this.data.collection) {
      wrapper.appendChild(collectionBox);
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
    const select = blockContent.querySelector('#collectionsSelector');
    const selectLayout = blockContent.querySelector('#collectionsLayoutSelector');
    const selectStatus = blockContent.querySelector('#collectionsStatusSelector');
    const contactPage = blockContent.querySelector('#collectionsPageSelector');
    const contactTab = blockContent.querySelector('#collectionsTabSelector');
    const contactAccordion = blockContent.querySelector('#collectionsAccordionSelector');
    const selectedTopics = blockContent.querySelectorAll('#collectionsTopicSelector option:checked');
    const topics = Array.from(selectedTopics).map(el => el.value);

    if (!select) {
      return this.data;
    }

    return Object.assign(this.data, {
      collection: select.value,
      layout: selectLayout.value,
      status: selectStatus.value,
      page: contactPage.value,
      tab: contactTab.value,
      accordion: contactAccordion.value,
      topics: topics,
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
  async fetchFields(data) {

    // console.log('fetchFields data: ', data)
    try {
      const response = await fetch(`${ this.fieldsEndpoint }`);
      const collectionItems = await response.json();
      let fields = []
  
      const items = collectionItems.data
      items.filter(item => {
        if(item.collection === data.collection) {
          fields.push({ field: item.field, type: item.type });
        }
      });

      this.data.collection = data.collection;
      this.data.fields = data.fields;
      this.data.page = data.page;
      this.data.tab = data.tab;
      this.data.accordion = data.accordion;
      this.data.layout = data.layout;
      this.data.status = data.status;
   
      // waits until the request completes...
      // ('response from api yo -----> ', collection, fields, items);

    } catch(err){
      console.error(err);
    }
    
  }

  async fetchCollections() {

    const cItems = [
      'announcements',
      'companies',
      'contacts',
      'events',
      'press_releases',
      'reporter_letters',
      'NYMEX',
      'rulemakings',
      'index_zones',
      'ibmp',
      'indian_gas_major_portion',
      'solid_minerals_handbook',
      'production_handbook',
      'revenue_handbook',
      'geothermal_class_1',
      'geothermal_class_2_3',
      'plant_specific_ucas',
      'Interest_Oil_and_Gas',
    ];
    let nArr = []
    
    try {
      const collectionsResponse = await fetch(`${ this.collectionsEndpoint }`);
      const collections = await collectionsResponse.json();
  
      collections.data.map(item => {
        if (cItems.includes(item.collection)) {
          nArr.push(item.collection)
        }
      })

      return nArr.sort((a, b) => b - a);
      
    } catch(err){
      console.error(err);
    }
    
  }


  async fetchContacts() {

    let pages = [];
    let tabs = [];
    let accordions = [];
    
    try {
      const collectionsResponse = await fetch(`${ this.contactsEndpoint }`);
      const categories = await collectionsResponse.json();
  
      categories.data.map(item =>  {
        // console.log('fetchContacts -----> ', item)
        if (!pages.includes(item.page) && item.page !== null) {
          pages.push(item.page);
        }

        if (!tabs.includes(item.tab) && item.tab !== null) {
          tabs.push(item.tab);
        }

        if (!accordions.includes(item.accordion) && item.accordion !== null) {
          accordions.push(item.accordion);
        }
      });

      // console.log('pages ----> ', pages) 

      return [
        pages, 
        tabs, 
        accordions
      ];
      
    } catch(err){
      console.error(err);
    }
    
  }

  async fetchReportersLetterTopcis() {
    let topcisArr = []
    try {
      const response = await fetch(`${ this.reporterLettersTopicsEndpoint }`);
      const items = await response.json();

      items.data.forEach(item => {
        item.topics.forEach(topic => {
          if (!topcisArr.includes(topic)) {
            topcisArr.push(topic)
          }
        })
        
      })

      return topcisArr.sort();

    } catch(err) {
      throw new Error(`Fetch error: ${ err }`);
    }
  }


}

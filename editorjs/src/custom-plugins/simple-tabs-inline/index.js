/**
 * Build Styles
 */
// require('./index.css').toString()

class SimpleTabsInline {
  static get toolbox() {
    return {
      title: 'Tabs',
      icon: '<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path d="M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h10v4h8v10z"></path></svg>'
    }
  }

  static get isInline() {
    return true
  }

  constructor({ data, config, api, readOnly }) {

    this.data = {
      tabs: data.tabs || [],
      tabContents: data.tabContents || []
    }
    this.api = api
    this.readOnly = readOnly
    this.blockIndex = this.api.blocks.getCurrentBlockIndex() + 1
    this.tabCount = 0


    this.CSS = {
      baseClass: this.api.styles.block,
      loading: this.api.styles.loader,

      wrapper: 'cdx-simple-tabs',
      tabCard: 'cdx-tab-card',
      tabList: 'cdx-tab-list',
      tabContentItem: this.api.styles.input,
      tabContentList: 'cdx-tab-content-list',
      tabItem: 'cdx-tab-item',
      tabButton: 'cdx-tab-button',
      tabRemoveButton: 'cdx-tab-remove-button',
      tabActions: 'cdx-tab-actions',
      tabActionButton: this.api.styles.button,
    }
    
    // Nodes
    this.nodes = {
      wrapper: null,
      tabCard: null,
      tabList: null,
      tabContentList: null,
      tabActions: null,
      output: null
    }

    console.log('this.data no timeout--------> ', this.data)
  }

  /**
   * Create blocks
   * @returns 
   */
  render() {
    // make elements
    const wrapper = this._make('div', [this.CSS.wrapper]),
      tabCard = this._make('div', [this.CSS.tabCard]),
      tabList = this._make('div', [this.CSS.tabList]),
      tabContentList = this._make('div', [this.CSS.tabContentList]),
      tabActions = this._make('div', [this.CSS.tabActions]),
      tabAddBtn = this._make(
        'button', 
        [this.CSS.tabActionButton], 
        { 
          id: 'tabAddBtn', 
          innerHTML: 'Add Tab', 
          onclick: (event) => {
            this.createTabs(false)
            this.setActiveClass(event)
          } 
        }
      )
      // tabSaveBtn = this._make(
      //   'button',
      //   [this.CSS.tabActionButton], 
      //   { 
      //     id: 'tabAddBtn', 
      //     innerHTML: 'Save', 
      //     onclick: (event) => {
      //       this.api.saver.save().then((output) => {
      //         this.nodes.output.innerHTML = JSON.stringify(output, undefined, 4)
      //       })
      //     } 
      //   }
      // ),
      // output = this._make('pre', ['ouput'])


    tabCard.appendChild(tabList)
    tabCard.appendChild(tabContentList)
    tabActions.appendChild(tabAddBtn)
    // tabActions.appendChild(tabSaveBtn)

    wrapper.append(tabCard)
    wrapper.appendChild(tabActions)
    // wrapper.appendChild(output)
    
    this.nodes.wrapper = wrapper
    this.nodes.tabCard = tabCard 
    this.nodes.tabList = tabList 
    this.nodes.tabContentList = tabContentList
    this.nodes.tabActions = tabActions
    // this.nodes.tabSaveBtn = tabSaveBtn
    // this.nodes.output = output

    console.log('this yo------->', this)
    if (this.data && this.data.tabs.length > 0) {
      this.createTabs(this.data)
    } else {
      this.createTabs(false)
    }

    return wrapper
  }

  // save method
  save(blockContent) {
    console.log('save blockContent-------> ', blockContent)
    const tabsArr = []
    const tabContentArr = []
    const tabs = blockContent.querySelectorAll(`.cdx-tab-list .${ this.CSS.tabButton }`)
    const tabContent = blockContent.querySelectorAll(`.cdx-tab-content-list .${ this.CSS.tabContentItem }`)

    const sanitizerConfig = {
      b: true, 
      a: {
        href: true
      },
      i: true
    }

    Array.from(tabs).forEach(element => {
      tabsArr.push(element.innerText || '')
    })

    Array.from(tabContent).forEach(element => {
      tabContentArr.push(element.innerText || '')
    })

    if (!tabs && !tabContent) {
      return this.data
    }


    return Object.assign(this.data, {
      tabs: tabsArr || [],
      tabContents: tabContentArr || []
    })
  }

  // validate
  validate(savedData) {
    // console.log('savedData-------->', savedData)
    if ( 
      (Array.isArray(savedData.tabs) && savedData.tabs.length === 0) || 
      (Array.isArray(savedData.tabContents) && savedData.tabContents.length === 0)) {
        alert('Add content to tab before adding another.')
        return false
    }

    return true
  }

  // active classes
  setActiveClass(event) {
    const activeElements = document.querySelectorAll('.ce-block--focused .active')
    const tabItems = document.querySelectorAll('.ce-block--focused .cdx-tab-list .cdx-tab-item .active')
    const tabs = document.querySelectorAll('.ce-block--focused .cdx-tab-list .active')
    const tabContents = document.querySelectorAll('.ce-block--focused .cdx-tab-content-list .active')

    // console.log('event, activeElements-------->', event, activeElements)

    // set active tab when adding tab
    if (event && event.target.id === 'tabAddBtn') {
      tabItems.forEach((element, index) => {
        if (index !== 0) element.classList.remove('active')
      })
      tabs.forEach((element, index) => {
        if (index !== 0) element.classList.remove('active')
      })
      tabContents.forEach((element, index) => {
        if (index !== 0) element.classList.remove('active')
      })
    } else {
      tabs.forEach((element, index) => {
        element.classList.remove('active')
      })
      event.target.classList += ' active'
      event.target.parentNode.classList += ' active'

      const targetId = event.target.id.replace('tabBtn__', '')
      const targetContent = document.querySelector(`.ce-block--focused #tabContent__${ targetId }`)

      tabContents.forEach((element, index) => {
        element.classList.remove('active')
      })

      targetContent.classList += ' active'
    }
  }

  /**
   * 
   * @param {*} data boolean
   */
  createTabs(data) {
    // console.log('createTabs------>', data)
    if (data) {
      data.tabs.forEach((tab, index) => {
        this.tabCount++
        const tabItem = this._make(
          'div',
          index === 0 ? [this.CSS.tabItem, 'active'] : [this.CSS.tabItem], 
        ),
        tabBtn = this._make(
          'span', 
          index === 0 ? [this.CSS.tabButton, 'active'] : [this.CSS.tabButton], 
          { 
            id: `tabBtn__${ index }`, 
            innerHTML: tab,
            contentEditable: !this.readOnly,
            onclick: (event) => {
              this.setActiveClass(event)
            } 
          }
        ),
        tabRemoveBtn = this._make(
          'span',
          [this.CSS.tabRemoveButton],
          {
            innerHTML: 'x',
            onclick: (event) => {
              this.removeTab(event)
            }
          }
        )

        tabItem.appendChild(tabBtn)
        tabItem.appendChild(tabRemoveBtn)
        this.nodes.tabList.appendChild(tabItem)
      })

      if (data.tabContents) {
        data.tabContents.forEach((tabItem, index) => {
          const tabContent = this._make(
            'div', 
            index === 0 ? [this.CSS.tabContentItem, 'active']: [this.CSS.tabContentItem], 
            { 
              id: `tabContent__${ index }`, 
              innerHTML: tabItem,
              contentEditable: true,
            })
          this.nodes.tabContentList.appendChild(tabContent)
        })
      }
    } else {
      this.tabCount++

      const tabItem = this._make(
        'div',
        [this.CSS.tabItem, 'active'], 
      ),
      tabBtn = this._make(
        'span', 
        [this.CSS.tabButton, 'active'], 
        { 
          id: `tabBtn__${ this.tabCount }`, 
          innerHTML: `Tab ${ this.tabCount }`,
          contentEditable: !this.readOnly,
          onclick: (event) => {
            this.setActiveClass(event)
          }   
        }
      ),
      tabRemoveBtn = this._make(
        'span',
        [this.CSS.tabRemoveButton],
        {
          innerHTML: 'x',
          onclick: (event) => {
            this.removeTab(event)
          }
        }
      )
      
      // create tab content
      const tabContent = this._make(
        'div', 
        [this.CSS.tabContentItem, 'active'], 
        { 
          id: `tabContent__${ this.tabCount }`, 
          contentEditable: !this.readOnly,
          innerHTML: `Tab content ${ this.tabCount }...`  
        }
      )

      tabItem.appendChild(tabBtn)
      tabItem.appendChild(tabRemoveBtn)
      this.nodes.tabList.appendChild(tabItem)
      this.nodes.tabContentList.appendChild(tabContent)
    }
  }

  // remove tab
  removeTab(event) {
    this.tabCount--
    
    const targetId = event.target.previousSibling.id.split('__').pop()
    event.target.parentNode.remove()
    document.getElementById(`tabContent__${ targetId }`).remove()
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

}

module.exports = SimpleTabsInline

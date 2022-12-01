import { Grid } from "gridjs";
import "gridjs/dist/theme/mermaid.css";

export default class LinksTool {

  constructor({ data, config, api }) {
      this.data = {
          type: data.type || 'Inline',
          links:  data.links || [],
          innerHtml: data.innerHtml || '',
      };

    this.api = api;
    this.config = config || {};

    this.linksEndpoint = this.config.linksEndpoint;
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
       id:'wrapper',
       /**
        * Tool's classes
        */
       wrapper: 'cdx-link',
     };

    this.nodes = {
      wrapper: null,
      linkBox: null,
    };

    // console.log('this.data yo ---------> ', this.data)

    // setTimeout(() => {
    //   console.log('this.data yo after 3 seconds ---------> ', this.data)
    // }, 3000);

  }
    static get sanitize(){
        return {
            url: true, // disallow HTML
            caption: {} // only tags from Inline Toolbar
        }
  }
static get isInline() {
    return false;
  }

    static get toolbox() {
    return {
	title: 'Links',

      icon: '<svg width="20" height="20" viewBox="0 0 22 22"><path d="M8.567 13.629c.728.464 1.581.65 2.41.558l-.873.873A3.722 3.722 0 1 1 4.84 9.794L6.694 7.94a3.722 3.722 0 0 1 5.256-.008L10.484 9.4a5.209 5.209 0 0 1-.017.016 1.625 1.625 0 0 0-2.29.009l-1.854 1.854a1.626 1.626 0 0 0 2.244 2.35zm2.766-7.358a3.722 3.722 0 0 0-2.41-.558l.873-.873a3.722 3.722 0 1 1 5.264 5.266l-1.854 1.854a3.722 3.722 0 0 1-5.256.008L9.416 10.5a5.2 5.2 0 0 1 .017-.016 1.625 1.625 0 0 0 2.29-.009l1.854-1.854a1.626 1.626 0 0 0-2.244-2.35z" transform="translate(-3.667 -2.7)"></path></svg>'
    }

  }
    render() {

const grid = new Grid({
    search: true,
    sort: true,
    pagination: true,
    columns: ["url", "label", "category"],
server: {
    url: 'http://localhost:8055/items/links?limit=-1',
    then: data => data.data.map(item => [item.url, item.label, item.category])
  }
});


console.log('render this.data ----------> ', grid)

        const  wrapper = this._make('div', [this.CSS.wrapper, 'ce-paragraph'],{contenteditable:"true"});
/*      selectInputLabel = this._make('label'),
      selectInput = this._make('select', [this.CSS.input]),
      selectLayoutInputLabel = this._make('label'),
      selectLayoutInput = this._make('select', [this.CSS.input]),
      selectStatusInputLabel = this._make('label'),
      selectStatusInput = this._make('select', [this.CSS.input]),
      selectFieldsCol1 = this._make('div', [this.CSS.baseClass]),
      selectFieldsCol2 = this._make('div', [this.CSS.baseClass]),
      selectFieldsCol3 = this._make('div', [this.CSS.baseClass]),
       linkBox = this._make('div');
*/
//document.createElement("wrapper");
    wrapper.style.margin = '10px 0';
    wrapper.style.display = 'flex';
    wrapper.style.justifyContent = 'flex-start';
    wrapper.style.flexBasis = '100%';
    wrapper.style.flexWrap = 'wrap';
//    wrapper.style.border = '1px solid black';
        const gridBox = this._make('div');
        gridBox.style.margin = '10px 0';
        gridBox.style.display = 'flex';
    gridBox.style.justifyContent = 'flex-start';
    gridBox.style.flexBasis = '100%';
    gridBox.style.flexWrap = 'wrap';
gridBox.style.border = '1px solid grey';

        const saveBox = this._make('div');

        saveBox.style.display = 'flex';
        saveBox.style.flexBasis = '100%';
        saveBox.style.flexWrap = 'wrap';
        saveBox.style.border = '1px solid grey';
        const saveButton = this._make('button')
        const cancelButton = this._make('button')
        saveButton.innerText='Save';
        cancelButton.innerText='Cancel';
        saveBox.appendChild(saveButton);
        saveBox.appendChild(cancelButton);

        const linkBox = this._make('div', ['cdx-block', 'ce-paragraph', 'foo'],{contentEditable:true});
//    linkBox.style.margin = '10px 0';
        //   linkBox.style.display = 'flex';

       // linkBox.contenteditable = true;
  //  linkBox.style.flexBasis = '100%';
  //  linkBox.style.flexWrap = 'wrap';
//	linkBox.style.border = '1px solid ';
	const linkList = this._make('ul')
	linkBox.appendChild(linkList)
        wrapper.appendChild(gridBox);
        wrapper.appendChild(saveBox);
        wrapper.appendChild(linkBox);
        saveBox.addEventListener('click', function(saveMe){
            console.debug("Save me ", saveMe, linkBox)
            gridBox.remove()
            saveBox.remove()
//            wrapper.replaceChild(linkBox)
        },linkBox, wrapper);

        saveBox.appendChild(saveButton);
	grid.render(gridBox);
    grid.on('rowClick', (...args) => {
        console.log('row: ' + JSON.stringify(args), args)
	const url=args[1]._cells[0].data
	const label=args[1]._cells[1].data
        this.addUrl(linkBox, url, label);

    }
       );

        if(this.data && this.data.type==="Inline" && this.data.text) {
            linkBox.innerHtml=this.data.innerHtml
        }

    return wrapper;
 //grid.render(wrapper);
}

    addUrl(linkList,url,label) {
const mydiv = this._make("li");
var aTag = document.createElement('a');
aTag.setAttribute('href',url);
aTag.setAttribute('aria-label',label);
aTag.setAttribute('title',url);
aTag.innerText = label;
mydiv.appendChild(aTag);
linkList.appendChild(mydiv);
    }


    save(blockContent){
    const caption = blockContent.querySelectorAll('.foo');
 /*  const sanitizerConfig = {
       a: false,
       ul: false,
       li: false,
     div: false
   };
*/
        const sanitized=caption[0].innerHTML
        const foo="asedf";//this.api.sanitizer.clean(caption.innerHTML || '', sanitizerConfig)
        console.debug("caption------------------>", caption, "Santitize ----------->", sanitized,"-------", caption.innerHTML,"------->", foo)
       const bar= Object.assign(this.data, {
        innerHTML: `${ sanitized }`,
        type: this.data.type,
        links: []
       });
        console.debug("bar-================>", bar);
        return bar
    }
  /**
   * Notify core that read-only mode is suppoorted
   *
   * @returns {boolean}
   */
  static get isReadOnlySupported() {
    return false;
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
   * @link {string}
   */
  async fetchFields(link, layout, status) {
    try {
      const response = await fetch(`${ this.fieldsEndpoint }`);
      const linkItems = await response.json();
      let fields = []

      const items = linkItems.data
      items.filter(item => {
        if(item.link === link) {
          fields.push({ field: item.field, type: item.type })
        }
      })

      this.data.link = link;
      this.data.fields = fields;
      this.data.layout = layout;
      this.data.status = status;

      // waits until the request completes...
      console.log('response from api yo -----> ', link, fields, items);

    } catch(err){
      console.error(err);
    }

  }

  async fetchLinks() {

//    const cItems = ['url', 'label', 'category'];
    let nArr = []

    try {
      const linksResponse = await fetch(`${ this.linksEndpoint }`);
      const links = await linksResponse.json();
     console.debug("Links: ", links)
      links.data.map(item => {
          nArr.push(item.label)
      })

      return nArr

    } catch(err){
      console.error(err);
    }

  }


}

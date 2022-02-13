import { Grid } from "gridjs";
import "gridjs/dist/theme/mermaid.css";
/**
 * Import functions
 */
import * as Dom from '../utils/dom';
import { SelectionUtils } from '../utils/selection';
//import { Utils } from '../utils/utils';


export default class LinksList {

  static get isInline() {
    return true;
  }

  constructor({ config, api }) {
    this.api=api;
    this.config=config || {};
    this.selection = new SelectionUtils();
    //this.selection=null;



    this.button = null;
    this.state = false;
    this.textNode = null;
    this.nodes = {
      toolButtons: null,
      toolButtonLink: null,
      toolButtonUnlink: null,
      
      actionsWrapper: null,
      inputWrapper: null,
      inputField: null,
      
      searchResults: null,
      
      linkDataWrapper: null,
      linkDataTitleWrapper: null,
      linkDataName: null,
      linkDataDescription: null,
      linkDataURL: null,


    };
  }
  
  render() {
    console.debug('  render() ------------->');
    /**
     * Create wrapper for buttons
     *
     * @type {HTMLButtonElement}
     */
    this.nodes.toolButtons = Dom.make('button', this.api.styles.inlineToolButton);
    
    /**
     * Create Link button
     *
     * @type {HTMLSpanElement}
     */
    this.nodes.toolButtonLink = Dom.make('span', LinksList.CSS.iconWrapper, {
      innerHTML: 'list <svg width="20" height="20" viewBox="0 0 22 22"><path d="M8.567 13.629c.728.464 1.581.65 2.41.558l-.873.873A3.722 3.722 0 1 1 4.84 9.794L6.694 7.94a3.722 3.722 0 0 1 5.256-.008L10.484 9.4a5.209 5.209 0 0 1-.017.016 1.625 1.625 0 0 0-2.29.009l-1.854 1.854a1.626 1.626 0 0 0 2.244 2.35zm2.766-7.358a3.722 3.722 0 0 0-2.41-.558l.873-.873a3.722 3.722 0 1 1 5.264 5.266l-1.854 1.854a3.722 3.722 0 0 1-5.256.008L9.416 10.5a5.2 5.2 0 0 1 .017-.016 1.625 1.625 0 0 0 2.29-.009l1.854-1.854a1.626 1.626 0 0 0-2.244-2.35z" transform="translate(-3.667 -2.7)"></path></svg>'
    });
    this.nodes.toolButtons.appendChild(this.nodes.toolButtonLink);

    /**
     * Create Unlink button
     *
     * @type {HTMLSpanElement}
     */
    /*      this.nodes.toolButtonUnlink = Dom.make('span',  LinksList.CSS.iconWrapper, {
            innerHTML: 'list <svg width="20" height="20" viewBox="0 0 22 22"><path d="M8.567 13.629c.728.464 1.581.65 2.41.558l-.873.873A3.722 3.722 0 1 1 4.84 9.794L6.694 7.94a3.722 3.722 0 0 1 5.256-.008L10.484 9.4a5.209 5.209 0 0 1-.017.016 1.625 1.625 0 0 0-2.29.009l-1.854 1.854a1.626 1.626 0 0 0 2.244 2.35zm2.766-7.358a3.722 3.722 0 0 0-2.41-.558l.873-.873a3.722 3.722 0 1 1 5.264 5.266l-1.854 1.854a3.722 3.722 0 0 1-5.256.008L9.416 10.5a5.2 5.2 0 0 1 .017-.016 1.625 1.625 0 0 0 2.29-.009l1.854-1.854a1.626 1.626 0 0 0-2.244-2.35z" transform="translate(-3.667 -2.7)"></path></svg>'
            });
            this.nodes.toolButtons.appendChild(this.nodes.toolButtonUnlink);
            
            this.toggleVisibility(this.nodes.toolButtonUnlink, false);
    */
    
    return this.nodes.toolButtons;
    
  }
  /**
   * Render actions element
   *
   * @returns {HTMLDivElement}
   */
  renderActions() {
    console.debug('  renderActions() ------------------>')

    /**
     * Render actions wrapper
     *
     * @type {HTMLDivElement}
     */
    this.nodes.actionsWrapper = Dom.make('div', [ LinksList.CSS.actionsWrapper ]);
    // this.toggleVisibility(this.nodes.actionsWrapper, false);

    /**
     * Render grid
     *
     * @type {HTMLDivElement}
     */

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
    /**
     * Render grid wrapper
     *
     * @type {HTMLDivElement}
     */ 

    this.nodes.gridWrapper = Dom.make('div', LinksList.CSS.gridWrapper);
    this.nodes.searchItem = Dom.make('div', LinksList.CSS.searchItem);
    grid.render(this.nodes.searchItem);
    this.nodes.gridWrapper.appendChild(this.nodes.searchItem);
    this.toggleVisibility(this.nodes.gridWrapper, false);

    /**
     * Render  link wrapper
     *
     * @type {HTMLDivElement}
     */ 
    this.nodes.linkWrapper = Dom.make('div', LinksList.CSS.linkWrapper);


    //Not working
    /*
      grid.on('rowClick', (...args) => {
      const selection=this.selection.restore();
      selection.removeFakeBackground();
      
      //document.execCommand('createLink', false, url);

      const newLink = selection.anchorElement;
      
      console.log('row: ' + JSON.stringify(args), args)
      const url=args[1]._cells[0].data
      const label=args[1]._cells[1].data
      console.debug("-----------ae- ", newLink)
      this.addUrl(newLink , url, label);
      
      
      });

      }
    */

    grid.on('rowClick', (...args) => {
      console.debug(" grid.on('rowClick', (...args) => ------------------>")
      const url=args[1]._cells[0].data
      const label=args[1]._cells[1].data
      const selection=this.selection
      selection.restore();
      
      console.debug("Selection ----------->",  this.textNode);
      this.addUrl( this.textNode , url, label);
    });
    this.nodes.actionsWrapper.appendChild(this.nodes.linkWrapper);
    this.nodes.actionsWrapper.appendChild(this.nodes.gridWrapper);
    
    return this.nodes.actionsWrapper;
  }

  
  surroundOLD(range) {
    if (this.state) {
      // If highlights is already applied, do nothing for now
      return;
    }

    const selectedText = range.extractContents();

    // Create MARK element
    const mark = document.createElement('MARK');

    // Append to the MARK element selected TextNode
    mark.appendChild(selectedText);
    this.selection=range;
    // Insert new element
    range.insertNode(mark);


    
  }
   static get sanitize() {
        return {
          ul: {},
          li: {},
          a: {}
        };
    }

  /**
   * Handle clicks on the Inline Toolbar icon
   *
   * @param {Range} range — range to wrap with link
   * @returns {void}
   */
  surround(range) {
    console.debug('  surround(range) ------------------>')
    if (!range) {
      return;
    }
    

    const selectedText = range.extractContents()
    const span = document.createElement('SPAN')
    span.appendChild(selectedText)
    const ul = document.createElement('UL')
    span.appendChild(ul)

    this.textNode=ul 
    range.insertNode(span);  
    
    
    /**
     * Show actions wrapper
     */
    this.toggleVisibility(this.nodes.actionsWrapper, true);
    this.toggleVisibility(this.nodes.gridWrapper, true);

    /**
     * Get result state after checkState() function
     * If tool button icon unlink is active then selected text is a link
     *
     * @type {boolean}
     */

    //this.selection.setFakeBackground();
    //console.debug("----------------->surround ", range, this.selection)
    //this.selection.save();
    // const parentAnchor = this.selection.findParentTag('A');
    /**
     * Expand selection
     */
    // this.selection.expandToTag(parentAnchor);
    
    /**
     * Remove the link
     */
    // document.execCommand('unlink');
    
    /**
     * Remove fake selection and close toolbar
     */
    //this.selection.removeFakeBackground();
    //this.api.inlineToolbar.close();
  }
  

  checkState(selection) {
    console.debug('    checkState(selection) ------------------>')
    const text = selection.anchorNode;
    
    if (!text) {
      return;
    }

    const anchorElement = text instanceof Element ? text : text.parentElement;
    console.debug( "anchor E ", anchorElement)
    this.state = !!anchorElement.closest('UL');
  }
  
  /**
   * Show or hide target element
   *
   * @param {HTMLElement} element — target element
   * @param {boolean} isVisible — visibility state
   * @returns {void}
   */
  toggleVisibility(element, isVisible = false) {
    /**
     * If not "isVisible" then add "hidden" class
     */
    console.debug("Toggle visibility: ", isVisible, " e: ", element)
    /* if(isVisible) {
       element.style.visibilty="visible"
       } else {
       element.style.visibility="hidden"
       }
    */      
    console.debug("Toggle visibility: ", isVisible, " e: ", element)
    if(isVisible) {
      element.style.display="flex"
    } else {
      element.style.display="none"
    }
    //        element.classList.toggle(LinksList.CSS.hidden, !isVisible);
  }


  addUrl(linkList,url,label) {
    console.debug('  addUrl(linkList,url,label) ------------------>')
    //    let  myUl = document.create("ul")
    let  myLi= document.createElement("li");
    let  aTag = document.createElement('a');
    aTag.setAttribute('href',url);
    aTag.innerText = label;
    myLi.appendChild(aTag);
    linkList.appendChild(myLi);
    aTag.insertAdjacentHTML('afterend', "&nbsp;")
        aTag.insertAdjacentHTML('beforebegin', "&nbsp;")
    

  }
  
  
  /**
   * @private
   *
   * @returns {object<string, string>} — keys and class names
   */
  static get CSS() {
    return {
      iconWrapper: 'ce-link-inline__icon-wrapper',
      
      hidden: 'ce-link-inline__hidden',
      
      actionsWrapper: 'ce-link-inline__actions-wrapper',


      
      gridWrapper: 'ce-link-inline__grid',
      gridWrapperLoading: 'ce-link-inline__grid--loading',
      gridWrapperInput: 'ce-link-inline__grid-input',
      
      searchItem: 'ce-link-inline__search-item',
      searchItemSelected: 'ce-link-inline__search-item--selected',
      searchItemName: 'ce-link-inline__search-item-name',
      searchItemDescription: 'ce-link-inline__search-item-description',
      
      linkDataWrapper: 'ce-link-inline__link-data-wrapper',
      linkDataTitleWrapper: 'ce-link-inline__link-data-title-wrapper',
      linkDataName: 'ce-link-inline__link-data-name',
      linkDataDescription: 'ce-link-inline__link-data-description',
      linkDataURL: 'ce-link-inline__link-data-url',
    };
  }
}



import { Grid } from "gridjs";

import "gridjs/dist/theme/mermaid.css";
/**
 * Build Styles
 */
//require('../styles/index.css').toString()


/**
 * Import functions
 */
import * as Dom from '../utils/dom';
import { SelectionUtils } from '../utils/selection';
//import { Utils } from '../utils/utils';


export default class LinksInline {

  static get isInline() {
    return true;
  }

  constructor({ config, api }) {
    this.api=api;
    this.config=config || {};
    this.selection = new SelectionUtils();
    //this.selection=null;

    this.endpoint=this.config.endpoint;
    this.queryParam=this.config.queryParam;
    console.debug('endpoint ---------------------->', this.endpoint, this.config);
    this.button = null;
    this.state = false;
    this.textNode = null;
    this.urlLabel='Selected'
    this.urlType='Inline'

    this.nodes = {
      toolButtons: null,
      toolButtonLink: null,
      toolButtonUnlink: null,

      actionsWrapper: null,
      inputWrapper: null,
      inlineRadio: null,
      inlineButtonWrapper: null,
      inlineButton: null,
      replaceRadio: null,

      searchResults: null,

      externalLinkWrapper: null,
      externalLinkInput: null,
      externalLinkButton: null,
      linkWrapper: null,
      linkUl: null,
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
    this.nodes.toolButtonLink = Dom.make('span', LinksInline.CSS.iconWrapper, {
      innerHTML: 'inline <svg width="20" height="20" viewBox="0 0 22 22"><path d="M8.567 13.629c.728.464 1.581.65 2.41.558l-.873.873A3.722 3.722 0 1 1 4.84 9.794L6.694 7.94a3.722 3.722 0 0 1 5.256-.008L10.484 9.4a5.209 5.209 0 0 1-.017.016 1.625 1.625 0 0 0-2.29.009l-1.854 1.854a1.626 1.626 0 0 0 2.244 2.35zm2.766-7.358a3.722 3.722 0 0 0-2.41-.558l.873-.873a3.722 3.722 0 1 1 5.264 5.266l-1.854 1.854a3.722 3.722 0 0 1-5.256.008L9.416 10.5a5.2 5.2 0 0 1 .017-.016 1.625 1.625 0 0 0 2.29-.009l1.854-1.854a1.626 1.626 0 0 0-2.244-2.35z" transform="translate(-3.667 -2.7)"></path></svg>'
    });
    this.nodes.toolButtons.appendChild(this.nodes.toolButtonLink);

    /**
     * Create Unlink button
     *
     * @type {HTMLSpanElement}
     */
    /*      this.nodes.toolButtonUnlink = Dom.make('span',  LinksInline.CSS.iconWrapper, {
            innerHTML: 'inline <svg width="20" height="20" viewBox="0 0 22 22"><path d="M8.567 13.629c.728.464 1.581.65 2.41.558l-.873.873A3.722 3.722 0 1 1 4.84 9.794L6.694 7.94a3.722 3.722 0 0 1 5.256-.008L10.484 9.4a5.209 5.209 0 0 1-.017.016 1.625 1.625 0 0 0-2.29.009l-1.854 1.854a1.626 1.626 0 0 0 2.244 2.35zm2.766-7.358a3.722 3.722 0 0 0-2.41-.558l.873-.873a3.722 3.722 0 1 1 5.264 5.266l-1.854 1.854a3.722 3.722 0 0 1-5.256.008L9.416 10.5a5.2 5.2 0 0 1 .017-.016 1.625 1.625 0 0 0 2.29-.009l1.854-1.854a1.626 1.626 0 0 0-2.244-2.35z" transform="translate(-3.667 -2.7)"></path></svg>'
            });
            this.nodes.toolButtons.appendChild(this.nodes.toolButtonUnlink);

            this.toggleVisibility(this.nodes.toolButtonUnlink, false);
    */

    console.debug('=-----------------adding element')
   var elemDiv = document.createElement('div');
    elemDiv.style.cssText = 'position:absolute;width:100%;height:100%;opacity:0.3;z-index:100;background:#000;';
    var main=document.getElementsByClassName('main')
    main[0].appendChild(elemDiv)

    console.debug('=-----------------adding element', elemDiv)
    return this.nodes.toolButtons;

  }

  addLinks() {
    console.debug('addLinks() ------------------------>')
    const links=this.nodes.linkWrapper
    //const nodes=links.querySelectorAll();
    //for(let nn=0; nn < nodes.length; nn++) {
    //  this.nodeText.appendChild(nodes[nn])
    //}

    if(this.getLabelType() === 'Append') {
      this.textNode.appendChild(links);
    } else {
      this.textNode.innerHTML=links.innerHTML;
    }
    console.debug('addLinks: ', links)
    this.api.inlineToolbar.close();
  }
  restoreSelection() {
     console.debug('restoreSelection() ------------------------>')

  }
  getLabel() {
    console.debug('getLabel() ------------------------>')
    const nodes=this.nodes.inlineRadio.querySelectorAll('[name=radioLabel]')
    for(let ii=0; ii< nodes.length; ii++) {
      if(nodes[ii].checked) {
        return nodes[ii].value
      }
    }
  }

  getLabelType() {
    console.debug('getLabel() ------------------------>')
    const nodes=this.nodes.inlineRadio.querySelectorAll('[name=radioLabel]')
    for(let ii=0; ii< nodes.length; ii++) {
      if(nodes[ii].checked) {
        return nodes[ii].value
      }
    }
  }


  getLinkType() {
    console.debug('getLabel() ------------------------>')
    const nodes=this.nodes.inlineRadio.querySelectorAll('[name=radioType]')
    for(let ii=0; ii< nodes.length; ii++) {
      if(nodes[ii].checked) {
        return nodes[ii].value
      }
    }
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
    this.nodes.actionsWrapper = Dom.make('div',  [ LinksInline.CSS.actionsWrapper ] );

    // this.toggleVisibili
    // this.toggleVisibility(this.nodes.actionsWrapper, false);

    /**
     * Render grid
     *
     * @type {HTMLDivElement}
     */

    const sort_by_page= (page_id,a,b) => {
      if(Math.abs(a.page_id - page_id) < Math.abs(b.page_id - page_id)) {
        return -1
      } else if ( Math.abs(a.page_id - page_id) > Math.abs(b.page_id - page_id)) {
        return 1
      } else {
        return 0
      }
    }
    const pageId=this.config.page_id;

    const grid = new Grid({
      search: true,
      sort: true,
      pagination: true,
      columns: ["label", "page", "category", "type", "target", "url"],
      server: {
        url: this.endpoint,
        then: data => {
          const sorted=data.data.sort( (a,b) => sort_by_page(pageId, a, b));
          return sorted.map(item => [ item.label,item.page, item.category, item.type, item.target, item.url])
        }
      }
    });
    /**
     * Render grid wrapper
     *
     * @type {HTMLDivElement}
     */



    this.nodes.gridWrapper = Dom.make('div');
    this.nodes.gridWrapper.style.display='block';

    this.nodes.searchItem = Dom.make('div', LinksInline.CSS.searchItem);
    grid.render(this.nodes.searchItem);
    this.nodes.inlineRadio = Dom.make('div', LinksInline.CSS.inlineRadio)
    this.nodes.inlineRadio.style.display='flex';

    this.nodes.inlineButtonWrapper = Dom.make('div', LinksInline.CSS.inlineButton)
    this.nodes.inlineButtonWrapper.style.display='flex';

    this.nodes.externalLinkWrapper = Dom.make('div', LinksInline.CSS.externalLinkWrapper)
    this.nodes.externalLinkWrapper.style.display='flex';

    const externalLinkInput=document.createElement('input');
    externalLinkInput.setAttribute('name','externalLinkInput');
    externalLinkInput.setAttribute('id','externalLinkInput');

    const externalLinkButton= document.createElement('button');

    this.nodes.externalLinkInput=externalLinkInput
    const createExternalLink= () => { this.createExternalLink() };
    externalLinkButton.addEventListener('click',function () { console.debug("createExternalLinks: ");  createExternalLink()});
    externalLinkButton.innerHTML='Create External Link'

    this.nodes.externalLinkWrapper.appendChild(externalLinkInput)
    this.nodes.externalLinkWrapper.appendChild(externalLinkButton)



    const spanButtonLabel=document.createElement('span');
    spanButtonLabel.innerText='Button: ';
    this.nodes.inlineButtonWrapper.appendChild(spanButtonLabel);
    const buttonCheckbox = document.createElement('input');
    buttonCheckbox.setAttribute('type', 'checkbox');
    buttonCheckbox.setAttribute('name','buttonCheckbox');

    buttonCheckbox.setAttribute('id','buttonCheckbox');
    this.nodes.inlineButton=buttonCheckbox;
    this.nodes.inlineButtonWrapper.appendChild(buttonCheckbox);

    const spanLabel=document.createElement('span');
    spanLabel.innerText='Label: ';
    this.nodes.inlineRadio.appendChild(spanLabel);

    const radioSelected = document.createElement('input');
    radioSelected.setAttribute('type', 'radio');
    radioSelected.setAttribute('name','radioLabel');
    radioSelected.setAttribute('value','Selected');
    radioSelected.setAttribute('checked',true);
    radioSelected.setAttribute('id','radioSelected');

    const labelSelected=document.createElement('label');
    labelSelected.setAttribute('for','radioSelected');
    labelSelected.innerHTML ='Selected';
    this.nodes.inlineRadio.appendChild(radioSelected)
    this.nodes.inlineRadio.appendChild(labelSelected)
    //this.nodes.inlineRadio.appendChild(document.createElement('br'))




    const radioAppend = document.createElement('input');
    radioAppend.setAttribute('type', 'radio');
    radioAppend.setAttribute('name','radioLabel');
    radioAppend.setAttribute('id','radioAppend');
    radioAppend.setAttribute('value','Append');

    const labelAppend=document.createElement('label');
    labelAppend.setAttribute('for','radioAppend');
    labelAppend.innerHTML ='Append';


    this.nodes.inlineRadio.appendChild(radioAppend)
    this.nodes.inlineRadio.appendChild(labelAppend)
    //this.nodes.inlineRadio.appendChild(document.createElement('br'))

    const radioReplace = document.createElement('input');
    radioReplace.setAttribute('type', 'radio');
    radioReplace.setAttribute('name','radioLabel');
    radioReplace.setAttribute('value','Replace');
    radioReplace.setAttribute('id','radioReplace');

    const labelReplace=document.createElement('label');
    labelReplace.setAttribute('for','radioReplace');
    labelReplace.innerHTML ='Replace';
    this.nodes.inlineRadio.appendChild(radioReplace)
    this.nodes.inlineRadio.appendChild(labelReplace)
    this.nodes.inlineRadio.appendChild(document.createElement('br'))
    const span1=document.createElement('span')
    span1.innerHTML='&nbsp;&nbsp;&nbsp;||&nbsp;&nbsp;&nbsp;'
    this.nodes.inlineRadio.appendChild(span1)

    const spanType=document.createElement('span');
    spanType.innerText=' Type: ';
    this.nodes.inlineRadio.appendChild(spanType);

    const radioInline = document.createElement('input');
    radioInline.setAttribute('type', 'radio');
    radioInline.setAttribute('name','radioType');
    radioInline.setAttribute('value','Inline');
    radioInline.setAttribute('checked',true);
    radioInline.setAttribute('id','radioInline');
    const labelInline=document.createElement('label');
    labelInline.setAttribute('for','radioInline');
    labelInline.innerHTML ='Inline';

    this.nodes.inlineRadio.appendChild(radioInline)
    this.nodes.inlineRadio.appendChild(labelInline)
    //this.nodes.inlineRadio.appendChild(document.createElement('br'))


    const radioList = document.createElement('input');
    radioList.setAttribute('type', 'radio');
    radioList.setAttribute('name','radioType');
    radioList.setAttribute('value','List');
    radioList.setAttribute('id','radioList');
    const labelList=document.createElement('label');
    labelList.setAttribute('for','radioList');
    labelList.innerHTML ='List';
    this.nodes.inlineRadio.appendChild(radioList)
    this.nodes.inlineRadio.appendChild(labelList)
    const span2=document.createElement('span')
    span2.innerHTML='&nbsp;&nbsp;&nbsp;||&nbsp;&nbsp;&nbsp;'
    this.nodes.inlineRadio.appendChild(span2)

    const addLinks= () => { this.addLinks() };
    const buttonAdd = document.createElement('button');
    buttonAdd.addEventListener('click',function () {console.debug("addLInks: ", addLinks);  addLinks(); });

    const restoreSelection= () => { this.restoreSelection() };
    buttonAdd.innerHTML='  Add  '

    const span3=document.createElement('span')
    span3.innerHTML='&nbsp;&nbsp;::&nbsp;&nbsp;'


    const buttonCancel = document.createElement('button');
    buttonCancel.addEventListener('click', function() {console.debug("restoreSelection: ", restoreSelection); restoreSelection()})
    buttonCancel.innerHTML='  Cancel  '

    this.nodes.inlineRadio.appendChild(buttonAdd)
        this.nodes.inlineRadio.appendChild(span3)
    this.nodes.inlineRadio.appendChild(buttonCancel)
    this.nodes.gridWrapper.appendChild(this.nodes.inlineButtonWrapper);
    this.nodes.gridWrapper.appendChild(this.nodes.inlineRadio);
    this.nodes.gridWrapper.appendChild(document.createElement('br'))
    this.nodes.gridWrapper.appendChild(this.nodes.externalLinkWrapper);

    this.nodes.gridWrapper.appendChild(this.nodes.searchItem);
    this.toggleVisibility(this.nodes.gridWrapper, false);



    /**
     * Render  link wrapper
     *
     * @type {HTMLDivElement}
     */
    this.nodes.linkWrapper = Dom.make('span', LinksInline.CSS.linkWrapper);
    //this.nodes.linkWrapper.setAttribute('contenteditable', true);

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
      //item.label,item.page, item.category, item.type, item.target, item.url
      const url=args[1]._cells[5].data

      const label=args[1]._cells[0].data;
      const type=args[1]._cells[3].data

      this.getLabel();
      if(this.getLinkType() === 'Inline') {
        this.addUrl( this.nodes.linkWrapper , url, label, type);
      } else {
        if(this.nodes.linkUl) {
          this.addLi( this.nodes.linkUl , url, label,type);
        } else {
          const ul=Dom.make('ul');
          this.nodes.linkUl=ul
          this.addLi( this.nodes.linkUl , url, label,type);
          this.nodes.linkWrapper.appendChild(this.nodes.linkUl)
          //
        }
      }
    });


    this.nodes.actionsWrapper.appendChild(this.nodes.linkWrapper);

    this.nodes.actionsWrapper.appendChild(this.nodes.gridWrapper);

    return this.nodes.actionsWrapper;
  }

  createExternalLink() {
    console.debug('----- create external links -----------------------------')
    const url = this.nodes.externalLinkInput.value
    const type = 'application/external'
    const label = 'Click me'
    if(this.getLinkType() === 'Inline' ) {
      this.addUrl( this.nodes.linkWrapper, url, label, type);
    } else {
      if(this.nodes.linkUl) {
        this.addLi( this.nodes.linkUl, url, label,type);
      } else {
        const ul=Dom.make('ul');
        this.nodes.linkUl=ul
        this.addLi( this.nodes.linkUl , url, label,type);
        this.nodes.linkWrapper.appendChild(this.nodes.linkUl)
      }
    }
  }

  shortcut() {
    console.debug('This shortcut ----------------->: ', this.selection)
    return 'ALT+L';
  }




  /**
   * Handle clicks on the Inline Toolbar icon
   *
   * @param {Range} range — range to wrap with link
   * @returns {void}
   */
  surround(range) {
    console.debug('  surround(range) ------------------>', range)
    if (!range) {
      console.debug('No range ------------------------------->')
      return;
    }
    const selectedText = range.extractContents()
    const span = document.createElement('SPAN')
    span.appendChild(selectedText)
    this.textNode=span
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
    this.state = !!anchorElement.closest('SPAN');
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
      element.style.display=""
    } else {
      element.style.display="none"
    }
    //        element.classList.toggle(LinksInline.CSS.hidden, !isVisible);
  }

    static get sanitize() {
    return {
      ul: true,
      li: true,
      a:{
        href:true,
        target:true,
        class:true

      },
      img: {
        src:true,
        height:true,
        width:true
      },
      i: {class: true},
      div: {class: true},
      span: true


    };
    }

  addIcon(url, extension) {
    var iconDiv = document.createElement('div');
    iconDiv.classList.add("v-list-item__icon");
    iconDiv.classList.add("ml-1");
    var i = document.createElement('i');
    i.setAttribute('aria-hidden',true);
    i.classList.add('v-icon');
    i.classList.add('notranslate');
    i.classList.add('mdi');
    console.debug('extension: -------------------------------------------> ', extension);
    const docType=url.split('.').pop();
    extension= docType.length===3 || docType.length===4 ? docType : extension
    switch(extension) {
    case 'pdf':
      i.classList.add('mdi-file-pdf-box')
      break
    case 'xls':
      i.classList.add('mdi-file-excel-box')
      break
    case 'xlsx':
      i.classList.add('mdi-file-excel-box')
      break
    case 'vnd.openxmlformats-officedocument.spreadsheetml.sheet':
      i.classList.add('mdi-file-excel-box')
      break
    case 'vnd.openxmlformats-officedocument.wordprocessingml.document':
      i.classList.add('mdi-file-word-box')
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      i.classList.add('mdi-file-word-box')
      break
    case 'vnd.openxmlformats-officedocument.presentationml.presentation':
      i.classList.add('mdi-file-powerpoint-box')
      break
      case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
        i.classList.add('mdi-file-powerpoint-box')
        break
        case 'pptx':
          i.classList.add('mdi-file-powerpoint-box')
          break
          case 'ppt':
            i.classList.add('mdi-file-powerpoint-box')
            break
    case 'plain':
      i.classList.add('mdi-text-box')
      break
    case 'external':
      i.classList.add('no-icon')
      break
    case 'reporter-letters':
      i.classList.add('no-icon')
      break
    case 'press-releases':
      i.classList.add('no-icon')
      break
    default:
      return
    }

    iconDiv.appendChild(i)
    return iconDiv




  }




  addLi(linkList,url,filename,type) {
    console.debug('addUrl(linkList,url,label) ------------------>')
    const mydiv = Dom.make("li");
    const fparts=type.split("/")
    const label=this.getLabelType() === 'Selected' ? this.textNode.innerText : filename
    // const label=fparts[0]
    const extension= fparts.length > 1 ? fparts.pop() : ''
    const icon=this.addIcon(url, extension);

    var aTag = document.createElement('a');
    aTag.setAttribute('href',url);
    aTag.setAttribute('download',label+'.'+extension);
    if(this.nodes.inlineButton.checked) {
      aTag.classList.add(LinksInline.CSS.linkButton)
    }


    aTag.innerText = label;
    mydiv.appendChild(aTag);
    linkList.appendChild(mydiv);
    if(icon) {
      aTag.setAttribute('target','_blank');
      mydiv.appendChild(icon)
    }
    //    linkList.insertAdjacentHTML('afterend', "&nbsp;")


  }



  addUrl(linkList,url,filename,type) {
    console.debug('addUrl(linkList,url,filename, type) ------------------>')
    //const mydiv = Dom.make("li");
    const fparts=type.split("/")
    const label=this.getLabelType() === 'Selected' ? this.textNode.innerText : filename
    //    const label=fparts[0]
    const extension= fparts.length > 1 ? fparts.pop() : ''
    const icon=this.addIcon(url,extension);

    var aTag = document.createElement('a');
    aTag.setAttribute('href',url);
    aTag.setAttribute('aria-label',label);
    aTag.setAttribute('title',url);
    aTag.setAttribute('download',label+'.'+extension);
    console.debug("----------------------------inlineButton> ", this.nodes.inlineButton)
    if(this.nodes.inlineButton.checked) {
      aTag.classList.add(LinksInline.CSS.linkButton)
    }

    aTag.innerText = label;
    // mydiv.appendChild(aTag);
    linkList.appendChild(aTag);
    if(icon) {
      aTag.setAttribute('target','_blank');
      linkList.appendChild(icon)
    }
    linkList.insertAdjacentHTML('afterend', "&nbsp;")


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

      externalLinkWrapper: 'ce-link-inline__external-link-wrapper',
      externalLinkInput: 'ce-link-inline__external-link-input',
      externalLinkButton: 'ce-link-inline__external-link-button',

      linkWrapper: 'ce-link-inline__link-wrapper',

      linkButton: 'ce-link-inline__link-button',
      linkDataTitleWrapper: 'ce-link-inline__link-title-wrapper',
      linkDataName: 'ce-link-inline__link-name',
      linkDataDescription: 'ce-link-inline__link-description',
      linkDataURL: 'ce-link-inline__link-url',
    };
  }
}

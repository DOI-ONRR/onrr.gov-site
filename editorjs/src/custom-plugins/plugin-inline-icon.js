import { make } from "../utils/dom";
import { SelectionUtils } from '../utils/selection';

export default class InlineIconTool {
  static get isInline() {
    return true;
  }

 static get sanitize() {
    return {
      span: {
        class: true,
      },
      i: {
        class: true,
      }
    };
  }

  get state() {
    return this._state;
  }

  set state(state) {
    this._state = state;

    this.nodes.button.classList.toggle(this.api.styles.inlineToolButtonActive, state);
  }

  constructor({ api }) {
    this.CSS = {
      button: 'ce-inline-tool',
      buttonActive: 'ce-inline-tool--active',
      input: 'ce-inline-tool-input',
      inputShowed: 'ce-inline-tool-input--showed',
      icon: 'v-icon'
    };

    this.nodes = {
      button: null,
      input: null,
      icon: null,
      wrapper: null,
    };

    this.i18n = api.i18n;
    this.ENTER_KEY = 13; // return key code
    this.inputOpened = false;
    this._state = false;
    this.api = api;
    this.selection = new SelectionUtils();
    this.selectedNode = null;
    this.toolbar = api.toolbarl;
    this.inlineToolbar = api.inlineToolbar;
  }

  render() {
    
    this.nodes.button = make('button', this.CSS.button);

    const svgIcon = `<svg style="width:24px;height:24px;" viewBox="0 0 24 24">
                        <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M14,7H10V9H11V15H10V17H14V15H13V9H14V7Z"></path>
                    </svg>`;

    this.nodes.button.innerHTML = svgIcon;
    // this.nodes.button.addEventListener('click', (e) => {
    //   console.log(e);
    //   this.showInput(e)
    // })

    return this.nodes.button;
  }

  renderActions() {
    this.nodes.input = make('input');
    this.nodes.input.classList.add(this.CSS.input);
    this.nodes.input.placeholder = this.i18n.t('Add a icon');
    this.nodes.input.addEventListener('keydown', (e) => {
      if(e.keyCode === this.ENTER_KEY) {
        console.log(e);
      }
    })

    return this.nodes.input;
  }

  surround(range) {
    if (this._state) {
      this.unwrap(range);
      return;
    }

    this.wrap(range);
  }

  showActions(span) {
    this.nodes.input.classList.add(this.CSS.inputShowed);
    this.inputOpened = true;
    this.nodes.input.focus();
    

    let value = this.nodes.input.value || '';

    span.classList.add(value);
  }

  hideActions() {
    this.nodes.input.hidden = true;
  }

   
  checkState(selection) {
    const text = selection.anchorNode;
    console.log('selection, this.selectedNode: ', selection, this.selectedNode)
    const spanTag = this.selection.findParentTag('span', 'outer-span');

    console.log('checkState spanTag ------> ', spanTag);
    
    if (!text) {
      return;
    }

    const anchorElement = text instanceof Element ? text : text.parentElement;
    console.debug( "anchor E ", anchorElement)
    this._state = !!anchorElement.closest('SPAN');

    if (this._state) {
      console.log('showActions yo!');
      this.showActions(anchorElement);
    } else {
      console.log('hideActions yo!');
      this.hideActions();
    }
  }

  wrap(range) {
    const selectedText = range.extractContents();

    // Create span element
    const span = make('span');
    span.classList.add('outer-span');

    
    const innerSpan = make('span');
    innerSpan.classList.add('inner-span');

    // Append to the span element selected TextNode
    innerSpan.appendChild(selectedText);

    span.appendChild(innerSpan);

    this.selectedNode = span;
    // Insert new element
    range.insertNode(span);
  }

  unwrap(range) {
    const span = this.api.selection.findParentTag('span', 'outer-span');
    const text = range.extractContents();

    span.remove();

    range.insertNode(text);
  }

  showInput() {
    this.nodes.input.classList.add(this.CSS.inputShowed);
    this.inputOpened = true;
    this.nodes.input.focus();
    

    let value = this.nodes.input.value || '';
    
    console.log(value);
    // do something with value
  }

  closeInput() {
    this.nodes.input.classList.remove(this.CSS.inputShowed);
    this.inputOpened = false;
  }

  insertIcon(icon) {
    // icon: https://materialdesignicons.com/
    console.log('icon this.selection ----> ', this.selection, icon);
    const spanTag = this.selection.findParentTag('SPAN');
    

    if(spanTag) {
      this.selection.expandToTag(spanTag)
    }
    // const iconEl = make('i');
    // iconEl.setAttribute('aria-hidden',true);
    // iconEl.classList.add('v-icon', icon);

    // const innerSpan = make('span');
    // innerSpan.innerText = 'this needs to be selection yo!'

    // if (this.textNode) {
    //   this.textNode.appendChild(iconEl);
    //   this.textNode.appendChild(innerSpan);
    // }

    // this.selection.expandToTag(this.textNode);
  }
}
//================================================================
// NOTE: This code is compatible with "@editorjs/editorjs@^2.19.0"
//================================================================

class MySelectionUtils {

  static get range() {
    const selection = window.getSelection();

    return selection && selection.rangeCount ? selection.getRangeAt(0) : null;
  }

  constructor() {
    this.instance = null;
    this.selection = null;
    this.savedSelectionRange = null;
    this.isFakeBackgroundEnabled = false;
    this._commandBackground = 'backColor';
    this._commandRemoveFormat = 'removeFormat';
  }

  removeFakeBackground() {
    if (!this.isFakeBackgroundEnabled) {
      return;
    }

    this.isFakeBackgroundEnabled = false;
    document.execCommand(this._commandRemoveFormat);
  }

  setFakeBackground() {
    document.execCommand(this._commandBackground, false, '#a8d6ff');

    this.isFakeBackgroundEnabled = true;
  }

  save() {
    this.savedSelectionRange = MySelectionUtils.range;
  }

  restore() {
    if (!this.savedSelectionRange) {
      return;
    }

    const sel = window.getSelection();

    sel.removeAllRanges();
    sel.addRange(this.savedSelectionRange);
  }

  clearSaved() {
    this.savedSelectionRange = null;
  }

  collapseToEnd() {
    const sel = window.getSelection();
    const range = document.createRange();

    range.selectNodeContents(sel.focusNode);
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);
  }

  findParentTag(tagName, className, searchDepth = 10) {
    const selection = window.getSelection();
    let parentTag = null;

    if (!selection || !selection.anchorNode || !selection.focusNode) {
      return null;
    }

    const boundNodes = [
      selection.anchorNode,
      selection.focusNode,
    ];

    boundNodes.forEach((parent) => {
      let searchDepthIterable = searchDepth;

      while (searchDepthIterable > 0 && parent.parentNode) {
        if (parent.tagName === tagName) {
          parentTag = parent;

          if (className && parent.classList && !parent.classList.contains(className)) {
            parentTag = null;
          }

          if (parentTag) {
            break;
          }
        }

        parent = parent.parentNode;
        searchDepthIterable--;
      }
    });

    return parentTag;
  }

  expandToTag(element) {
    const selection = window.getSelection();

    selection.removeAllRanges();
    const range = document.createRange();

    range.selectNodeContents(element);
    selection.addRange(range);
  }
}

class MyLinkTool {

  static get isInline() {
    return true;
  }

  static get title() {
    return 'Link';
  }

  static get sanitize() {
    return {
      a: {
        href: true,
        target: '_blank',
        rel: 'nofollow',
      },
    };
  }

  constructor({ api }) {
    this._commandLink = 'createLink';
    this._commandUnlink = 'unlink';
    this._ENTER_KEY = 13;
    this._CSS = {
      button: 'ce-inline-tool',
      buttonActive: 'ce-inline-tool--active',
      buttonModifier: 'ce-inline-tool--link',
      buttonUnlink: 'ce-inline-tool--unlink',
      input: 'ce-inline-tool-input',
      inputShowed: 'ce-inline-tool-input--showed',
    };
    this._nodes = {
      button: null,
      input: null,
    };
    this._inputOpened = false;
    this._toolbar = api.toolbar;
    this._inlineToolbar = api.inlineToolbar;
    this._notifier = api.notifier;
    this._i18n = api.i18n;
    this._selection = new MySelectionUtils();
  }

  render() {
    this._nodes.button = document.createElement('button');
    this._nodes.button.type = 'button';
    this._nodes.button.classList.add(this._CSS.button, this._CSS.buttonModifier);
    
    //================================================================
    // NOTE: Replace $.svg(...) in the below two lines to your icon.
    //================================================================
    const svg = `<svg style="width:24px;height:24px;" viewBox="0 0 24 24">
                        <path fill="#6F6F6F" ng-attr-d="{{icon.data}}" d="M12,12L14.33,16H9.68L12,12M12,8L6.21,18H17.8L12,8M12,2L1,21H23L12,2M12,6L19.53,19H4.47L12,6Z"></path>
                    </svg>`;
    this._nodes.button.innerHTML = svg;
    this._nodes.button.innerHTML = svg;

    return this._nodes.button;
  }

  renderActions() {
    this._nodes.input = document.createElement('input');
    this._nodes.input.placeholder = this._i18n.t('Add a link');
    this._nodes.input.classList.add(this._CSS.input);
    this._nodes.input.addEventListener('keydown', (event) => {
      if (event.keyCode === this._ENTER_KEY) {
        this._enterPressed(event);
      }
    });

    return this._nodes.input;
  }

  surround(range) {
    if (range) {
      if (!this._inputOpened) {
        this._selection.setFakeBackground();
        this._selection.save();
      } else {
        this._selection.restore();
        this._selection.removeFakeBackground();
      }
      const parentAnchor = this._selection.findParentTag('A');

      if (parentAnchor) {
        this._selection.expandToTag(parentAnchor);
        this._unlink();
        this._closeActions();
        this.checkState();
        this._toolbar.close();

        return;
      }
    }

    this._toggleActions();
  }

  checkState() {
    const anchorTag = this._selection.findParentTag('A');

    if (anchorTag) {
      this._nodes.button.classList.add(this._CSS.buttonUnlink);
      this._nodes.button.classList.add(this._CSS.buttonActive);
      this._openActions();

      const hrefAttr = anchorTag.getAttribute('href');

      this._nodes.input.value = hrefAttr !== 'null' ? hrefAttr : '';

      this._selection.save();
    } else {
      this._nodes.button.classList.remove(this._CSS.buttonUnlink);
      this._nodes.button.classList.remove(this._CSS.buttonActive);
    }

    return !!anchorTag;
  }

  clear() {
    this._closeActions();
  }

  get shortcut() {
    return 'CMD+K';
  }

  _toggleActions() {
    if (!this._inputOpened) {
      this._openActions(true);
    } else {
      this._closeActions(false);
    }
  }

  _openActions(needFocus = false) {
    this._nodes.input.classList.add(this._CSS.inputShowed);
    if (needFocus) {
      this._nodes.input.focus();
    }
    this._inputOpened = true;
  }

  _closeActions(clearSavedSelection = true) {
    if (this._selection.isFakeBackgroundEnabled) {
      const currentSelection = new MySelectionUtils();

      currentSelection.save();

      this._selection.restore();
      this._selection.removeFakeBackground();

      currentSelection.restore();
    }

    this._nodes.input.classList.remove(this._CSS.inputShowed);
    this._nodes.input.value = '';
    if (clearSavedSelection) {
      this._selection.clearSaved();
    }
    this._inputOpened = false;
  }

  _enterPressed(event) {
    let value = this._nodes.input.value || '';

    if (!value.trim()) {
      this._selection.restore();
      this._unlink();
      event.preventDefault();
      this._closeActions();
    }

    if (!this._validateURL(value)) {
      this._notifier.show({
        message: 'Pasted link is not valid.',
        style: 'error',
      });

      console.warn('Incorrect Link pasted %o', value);

      return;
    }

    value = this._prepareLink(value);

    this._selection.restore();
    this._selection.removeFakeBackground();

    this._insertLink(value);

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    this._selection.collapseToEnd();
    this._inlineToolbar.close();
  }

  _validateURL(str) {
    return !/\s/.test(str);
  }

  _prepareLink(link) {
    link = link.trim();
    link = this._addProtocol(link);

    return link;
  }

  _addProtocol(link) {
    if (/^(\w+):(\/\/)?/.test(link)) {
      return link;
    }

    const isInternal = /^\/[^/\s]/.test(link),
        isAnchor = link.substring(0, 1) === '#',
        isProtocolRelative = /^\/\/[^/\s]/.test(link);

    if (!isInternal && !isAnchor && !isProtocolRelative) {
      link = 'http://' + link;
    }

    return link;
  }

  _insertLink(link) {
    const anchorTag = this._selection.findParentTag('A');

    if (anchorTag) {
      this._selection.expandToTag(anchorTag);
    }

    document.execCommand(this._commandLink, false, link);
  }

  _unlink() {
    document.execCommand(this._commandUnlink);
  }
}

export default MyLinkTool;
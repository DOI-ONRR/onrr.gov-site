import LinkAutocomplete from '@editorjs/link-autocomplete';
import * as Dom from '../utils/editorjs-link-autocomplete/dom';
import notifier from 'codex-notifier';
import { Utils } from '../utils/editorjs-link-autocomplete/utils';

const DICTIONARY = {
  pasteOrSearch: 'Paste or search',
  pasteALink: 'Paste a link',
  searchRequestError: 'Cannot process search request because of',
  invalidServerData: 'Server responded with invalid data',
  invalidUrl: 'Link URL is invalid',
};


export class OnrrLinkAutocomplete extends LinkAutocomplete {
  
  searchItemPressed(element) {
    /**
     * If no useful dataset info was given then do nothing
     */
    if (!element.dataset || !element.dataset['href']) {
      return;
    }

    /**
     * Get link's href
     */
    const href = `${element.dataset['path']}${element.dataset['href']}`;

    /**
     * Restore origin selection
     */
    this.selection.restore();
    this.selection.removeFakeBackground();

    /**
     * Create a link by default browser's function
     */
    document.execCommand('createLink', false, href);

    /**
     * Get this link element
     */
    const newLink = this.selection.findParentTag(this.tagName);

    /**
     * All links except PDF documents open in current tab
     */
    newLink.target = href.toLowerCase().endsWith('pdf') ? '_blank' : '_self';

    /**
     * Fill up link element's dataset
     */
    Object.keys(element.dataset).forEach(key => {
      if (key === 'href') {
        return;
      }

      newLink.dataset[key] = element.dataset[key];
    });

    /**
     * Collapse selection and close toolbar
     */
    this.selection.collapseToEnd();
    this.api.inlineToolbar.close();
  }

  generateSearchList(items = []) {
    /**
     * Clear list first
     */
    this.clearSearchList();

    /**
     * If items data is not an array
     */
    if (!Utils.isArray(items)) {
      notifier.show({
        message: DICTIONARY.invalidServerData,
        style: 'error',
      });

      return;
    }

    /**
     * If no items returned
     */
    if (items.length === 0) {
      return;
    }

    /**
     * Fill up search list by new elements
     */
    items.forEach(item => {
      const searchItem = Dom.make('div', [ LinkAutocomplete.CSS.searchItem ]);

      /**
       * Create a name for a link
       */
      const searchItemName = Dom.make('div', [ LinkAutocomplete.CSS.searchItemName ], {
        innerText: item.name || item.href,
      });

      searchItem.appendChild(searchItemName);

      const searchItemFile = Dom.make('div', [ 'ce-link-autocomplete__search-item-file' ], {
        innerText: item.href,
      });

      searchItem.appendChild(searchItemFile);

      /**
       * Create a description element
       */
      if (item.description) {
        const searchItemDescription = Dom.make('div', [ LinkAutocomplete.CSS.searchItemDescription ], {
          innerText: item.description,
        });

        searchItem.appendChild(searchItemDescription);
      }

      /**
       * Save all keys to item's dataset
       */
      Object.keys(item).forEach(key => {
        searchItem.dataset[key] = item[key];
      });

      this.nodes.searchResults.appendChild(searchItem);
    });
  }

  renderActions() {
    /**
     * Render actions wrapper
     *
     * @type {HTMLDivElement}
     */
    this.nodes.actionsWrapper = Dom.make('div', [ LinkAutocomplete.CSS.actionsWrapper ]);
    this.toggleVisibility(this.nodes.actionsWrapper, false);

    /**
     * Render input field
     *
     * @type {HTMLDivElement}
     */
    this.nodes.inputWrapper = Dom.make('div', LinkAutocomplete.CSS.field);
    this.nodes.inputField = Dom.make('input', LinkAutocomplete.CSS.fieldInput, {
      placeholder: this.api.i18n.t(this.isServerEnabled ? DICTIONARY.pasteOrSearch : DICTIONARY.pasteALink),
    });

    this.nodes.inputWrapper.appendChild(this.nodes.inputField);
    this.toggleVisibility(this.nodes.inputWrapper, false);

    /**
     * Render search results
     *
     * @type {HTMLDivElement}
     */
    this.nodes.searchResults = Dom.make('div', LinkAutocomplete.CSS.foundItems);
    /**
     * To improve UX we need to remove any 'selected' classes from search results
     */
    this.nodes.searchResults.addEventListener('mouseenter', () => {
      const searchItems = this.getSearchItems();

      searchItems.forEach(item => {
        item.classList.remove(LinkAutocomplete.CSS.searchItemSelected);
      });
    });
    /**
     * Enable search results click listener
     */
    this.nodes.searchResults.addEventListener('click', (event) => {
      const closestSearchItem = event.target.closest(`.${LinkAutocomplete.CSS.searchItem}`);

      /**
       * If click target search item is missing then do nothing
       */
      if (!closestSearchItem) {
        return;
      }

      /**
       * Preventing events that will be able to happen
       */
      event.preventDefault();
      event.stopPropagation();

      this.searchItemPressed(closestSearchItem);
    });

    /**
     * Listen to pressed enter key or up and down arrows
     */
    this.nodes.inputField.addEventListener('keydown', this.fieldKeydownHandler.bind(this));

    /**
     * Listen to input
     */
    this.nodes.inputField.addEventListener('input', this.fieldInputHandler.bind(this));

    /**
     * Render link data block
     */
    this.nodes.linkDataWrapper = Dom.make('div', LinkAutocomplete.CSS.linkDataWrapper);
    this.toggleVisibility(this.nodes.linkDataWrapper, false);

    this.nodes.linkDataTitleWrapper = Dom.make('div', LinkAutocomplete.CSS.linkDataTitleWrapper);
    this.nodes.linkDataWrapper.appendChild(this.nodes.linkDataTitleWrapper);
    this.toggleVisibility(this.nodes.linkDataTitleWrapper, false);

    this.nodes.linkDataName = Dom.make('div', LinkAutocomplete.CSS.linkDataName);
    this.nodes.linkDataTitleWrapper.appendChild(this.nodes.linkDataName);
    this.nodes.linkDataDescription = Dom.make('div', LinkAutocomplete.CSS.linkDataDescription);
    this.nodes.linkDataTitleWrapper.appendChild(this.nodes.linkDataDescription);

    this.nodes.linkDataURL = Dom.make('A', LinkAutocomplete.CSS.linkDataURL);
    this.nodes.linkDataWrapper.appendChild(this.nodes.linkDataURL);

    /**
     * Compose actions block
     */
    this.nodes.actionsWrapper.appendChild(this.nodes.inputWrapper);
    this.nodes.actionsWrapper.appendChild(this.nodes.searchResults);
    this.nodes.actionsWrapper.appendChild(this.nodes.linkDataWrapper);

    return this.nodes.actionsWrapper;
  }

}

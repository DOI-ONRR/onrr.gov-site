import LinkAutocomplete from '@editorjs/link-autocomplete';


export default class extends LinkAutocomplete {
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
      const href = element.dataset['href'];
  
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

      newLink.text = element.dataset['name'];
  
      /**
       * Fill up link element's dataset
       */
      Object.keys(element.dataset).forEach(key => {
        if (key === 'href') {
          return;
        }
  
        newLink.dataset[key] = element.dataset[key];
      });

      newLink.dataset['icon'] = 'my-icon'
  
      /**
       * Collapse selection and close toolbar
       */
      this.selection.collapseToEnd();
      this.api.inlineToolbar.close();
    }

}

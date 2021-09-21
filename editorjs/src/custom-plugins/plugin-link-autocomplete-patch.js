import LinkAutocomplete from "@editorjs/link-autocomplete";
import notifier from 'codex-notifier';


export default class extends LinkAutocomplete {
    //

 constructor({ config, api }) {
     super({config, api});
     /**
      * Essential tools
      */
     this.api = api;
     this.config = config || {};
     this.linkAutocomplete=new LinkAutocomplete({config, api})
     this.selection = this.linkAutocomplete.selection
     
     console.debug("Overloading constructor?");
    /**
     * Config params
     */
    this.searchEndpointUrl = this.config.endpoint;
    this.searchQueryParam = this.config.queryParam;
    /**
     * Tool's nodes list
     *
     * toolButtons
     *   |- toolButtonLink
     *   |- toolButtonUnlink
     *
     * actionsWrapper
     *   |- inputWrapper
     *   |    |- inputField
     *   |    |- loader
     *   |
     *   |- searchResults
     *   |    |- searchItemWrapper
     *   |    |    |- searchItemName
     *   |    |    |- searchItemDescription
     *   |    |
     *   |    |- ...
     *   |
     *   |- linkDataWrapper
     *        |- URL
     *        |- name
     *        |- description
     */
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
     /**
      * Define tag name for a link element
      */
     this.tagName = 'A';

     /**
      * Key codes
      */
     this.KEYS = {
         ENTER: 13,
         UP: 38,
         DOWN: 40,
     };

     /**
      * Define debounce timer
      */
    this.typingTimer = null;
 
     
 }
  /**
   * Send search request
   *
   * @param {string} searchString - search string input
   *
   * @returns {Promise<SearchItemData[]>}
   */
    async searchRequest(searchString) {
     /**
      * Compose query string
      *
      * @type {string}
      */
     
     const queryString = new URLSearchParams({ [this.searchQueryParam]: searchString }).toString();
     
     try {
         /**
          * Get raw search data
          */
         const searchResponseRaw = await fetch(`${this.searchEndpointUrl}?${queryString}`);
         
         /**
          * Get JSON decoded data
          */
         const tmpSearchResponse = await searchResponseRaw.json();
         let searchResponse={}
 
         searchResponse.items=tmpSearchResponse.data.map( item => {return({href: item.href, name: item.label + ' (' + item.href + ')'})})

         searchResponse.success=true;
         console.debug("Overloading search request?", searchResponse)
      

         if (searchResponse && searchResponse.success) {
             return searchResponse.items;
         } else {
          console.warn('Link Autocomplete: invalid response format: "success: true" expected, but got %o. Response: %o', searchResponse.success, searchResponse);
         }
     } catch (e) {
         notifier.show({
          message: `${this.linkAutocomplete.DICTIONARY.searchRequestError} "${e.message}"`,
          style: 'error',
         });
     }
     
     return [];
    }

}

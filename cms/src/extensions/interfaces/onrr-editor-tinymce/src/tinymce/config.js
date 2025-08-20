import { createDirectus, rest } from '@directus/sdk';
  
export function createTinyConfig() {
  const base = {
    toolbar: 'bold italic underline h1 h2 h3 numlist bullist removeformat blockquote link image code ',
    plugins: 'lists link image table code',
    menubar: false,
    promotion: false,
    branding: false,
    statusbar: false,
    setup: function (editor) {
      const documentSelected = (autocompleteApi, rng, value) => {
        const doc = JSON.parse(value)
        editor.selection.setRng(rng)
        editor.insertContent(`<a href='${doc.file}'>${doc.title}</a>`)
        autocompleteApi.hide()
      }

      const getSearchResults = async searchTerm => {
        const client = createDirectus('http://localhost:8056').with(rest());

        return await client.request(() => ({
          path: `/link-autocomplete/?term=${searchTerm}`,
          method: 'GET',
        }));
      }

      editor.ui.registry.addAutocompleter('link_autocomplete', {
        trigger: ':',
        minChars: 1,
        columns: 1,
        highlightOn: ['file_title', 'file_name'],
        onAction: documentSelected,
        fetch: term => {
          return new Promise(async resolve => {
            const searchResults = await getSearchResults(term);
            const results = searchResults.items.map(item => ({
              type: 'cardmenuitem',
              value: JSON.stringify({
                title: item.href,
                file: `${item.path}${item.href}`,
              }),
              label: item.name,
              items: [
                {
                  type: 'cardcontainer',
                  direction: 'vertical',
                  items: [
                    {
                      type: 'cardtext',
                      text: item.name,
                      name: 'file_title',
                    },
                    {
                      type: 'cardtext',
                      text: item.href,
                      name: 'file_name'
                    }
                  ]
                }
              ]
            }))
            resolve(results)
          })
        }
      });
    }
  }

  return { ...base }
}

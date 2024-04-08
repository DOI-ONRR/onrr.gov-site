import { createDirectus, rest } from '@directus/sdk';
  
const config = {
  toolbar: 'undo redo styles bold italic numlist bullist alignleft aligncenter alignright outdent indent link code',
  plugins: 'lists link image table code wordcount',
  menubar: false,
  promotion: false,
  branding: false,
  setup: function (editor) {
    const onAction = (autocompleteApi, rng, value) => {
      const doc = JSON.parse(value)
      editor.selection.setRng(rng)
      editor.insertContent(`<a href='${doc.file}'>${doc.title}</a>`)
      autocompleteApi.hide()
    }

    const getSearchResults = async searchTerm => {
      const client = createDirectus('http://localhost:8055').with(rest());

      return await client.request(() => ({
        path: `/onrr-editor-autocomplete/search/${searchTerm}`,
        method: 'GET',
      }));
    }

    editor.ui.registry.addAutocompleter('specialchars_cardmenuitems', {
      trigger: ':',
      minChars: 1,
      columns: 1,
      highlightOn: ['char_name'],
      onAction: onAction,
      fetch: term => {
        return new Promise(async resolve => {
          const searchResults = await getSearchResults(term);
          const results = searchResults.map(char => ({
            type: 'cardmenuitem',
            value: JSON.stringify({
              title: char.title,
              file: char.href
            }),
            label: char.title,
            items: [
              {
                type: 'cardcontainer',
                direction: 'vertical',
                items: [
                  {
                    type: 'cardtext',
                    text: char.title,
                    name: 'char_name'
                  }
                ]
              }
            ]
          }))
          resolve(results)
        })
      }
    })
  }
}

export default { config }

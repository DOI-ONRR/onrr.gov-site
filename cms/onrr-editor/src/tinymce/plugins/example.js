const examplePlugin = (editor) => {
    const openDialog = () => editor.windowManager.open({
        title: 'Example plugin',
        body: {
          type: 'panel',
          items: [
            {
              type: 'input',
              name: 'title',
              label: 'Title'
            }
          ]
        },
        buttons: [
          {
            type: 'cancel',
            text: 'Close'
          },
          {
            type: 'submit',
            text: 'Save',
            buttonType: 'primary'
          }
        ],
        onSubmit: (api) => {
          const data = api.getData();
          /* Insert content when the window form is submitted */
          editor.insertContent('Title: ' + data.title);
          api.close();
        }
      });
      /* Add a button that opens a window */
      editor.ui.registry.addButton('example', {
        icon: 'link',
        tooltip: 'Add inline link',
        onAction: () => {
          /* Open window */
          openDialog();
        }
      });
      
      /* Return the metadata for the help plugin */
      return {
        getMetadata: () => ({
          name: 'Example plugin',
        })
      };
}

export { examplePlugin }
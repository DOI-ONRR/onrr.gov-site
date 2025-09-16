tinymce.PluginManager.add('onrr-table', (editor, url) => {
  editor.ui.registry.addToggleButton('onrr-table', {
    icon: 'table',
    tooltip: 'Insert table',
    onAction: () => {
      editor.execCommand('mceOnrrTable', false);
    },
    onSetup(api) {
      const unbind = editor.selection.selectorChanged('table', (state) => {
        api.setActive(state);
      });
      return () => unbind();
    },
  });

  return {
    getMetadata: () => ({
      name: 'ONRR Table'
    })
  }
});
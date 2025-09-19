tinymce.PluginManager.add('onrr-table', (editor, url) => {
  editor.ui.registry.addToggleButton('onrr-table', {
    icon: 'table',
    tooltip: 'Insert table',
    onAction: () => {
      editor.execCommand('mceOnrrTable', false);
    },
    onSetup(api) {
      const dispose = editor.selection.selectorChanged('table', (state) => {
        api.setActive(state);
      });
      return () => {
        if (typeof dispose === 'function') {
          dispose();
        } else if (dispose && typeof dispose.unbind === 'function') {
          dispose.unbind();
        }
      };
    },
  });

  return {
    getMetadata: () => ({
      name: 'ONRR Table'
    })
  }
});
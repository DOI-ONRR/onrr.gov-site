tinymce.PluginManager.add('onrr-link', (editor, url) => {
  editor.ui.registry.addToggleButton('onrr-link', {
    icon: 'link',
    tooltip: 'Insert/edit link',
    onAction: () => {
      editor.execCommand('mceOnrrLink', false);
    },
    onSetup(api) {
      const unbind = editor.selection.selectorChanged('a[href]', (state) => {
        api.setActive(state);
      });
      return () => unbind();
    },
  });

  return {
    getMetadata: () => ({
      name: 'ONRR Link'
    })
  }
});
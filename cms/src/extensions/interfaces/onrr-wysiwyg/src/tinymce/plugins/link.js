tinymce.PluginManager.add('onrr-link', (editor, url) => {
  editor.ui.registry.addToggleButton('onrr-link', {
    icon: 'link',
    tooltip: 'Insert/edit link',
    onAction: () => {
      editor.execCommand('mceOnrrLink', false);
    },
    onSetup(api) {
      const dispose = editor.selection.selectorChanged('a[href]', (state) => {
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
      name: 'ONRR Link'
    })
  }
});
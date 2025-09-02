tinymce.PluginManager.add('onrr-link', (editor, url) => {
  editor.ui.registry.addToggleButton('onrr-link', {
    icon: 'link',
    tooltip: 'Insert/edit link',
    onAction: (api) => {
      editor.execCommand('mceOnrrLink', false);
    }
  });

  return {
    getMetadata: () => ({
      name: 'ONRR Link'
    })
  }
});
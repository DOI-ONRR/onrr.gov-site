tinymce.PluginManager.add('onrr-glossary', (editor, url) => {
  editor.ui.registry.addButton('onrr-glossary', {
    icon: 'bookmark',
    tooltip: 'Tag glossary term',
    onAction: () => {
      editor.execCommand('mceOnrrGlossary', false);
    },
  });

  return {
    getMetadata: () => ({
      name: 'ONRR Glossary'
    })
  }
});

tinymce.PluginManager.add('onrr-glossary', (editor, url) => {
  const isTerm = (node) => !!node && node.nodeName === 'SPAN' && node.classList?.contains('term');
  const currentTerm = () => editor.dom.getParent(editor.selection.getNode(), 'span.term');
  const fireChange = () => (editor.dispatch ? editor.dispatch('change') : editor.fire('change'));

  // Main toolbar button — highlights when the caret is inside a tagged term.
  editor.ui.registry.addToggleButton('onrr-glossary', {
    icon: 'bookmark',
    tooltip: 'Tag glossary term',
    onAction: () => {
      editor.execCommand('mceOnrrGlossary', false);
    },
    onSetup: (api) => {
      const dispose = editor.selection.selectorChanged('span.term', (state) => api.setActive(state));
      return () => {
        if (typeof dispose === 'function') dispose();
        else if (dispose && typeof dispose.unbind === 'function') dispose.unbind();
      };
    },
  });

  // Context-toolbar action: change which glossary term this span points to (reopens the drawer).
  editor.ui.registry.addButton('glossary-edit', {
    icon: 'bookmark',
    tooltip: 'Change glossary term',
    onAction: () => {
      editor.execCommand('mceOnrrGlossary', false);
    },
  });

  // Context-toolbar action: remove the tag, keeping the text.
  editor.ui.registry.addButton('glossary-unlink', {
    icon: 'unlink',
    tooltip: 'Remove glossary term',
    onAction: () => {
      const term = currentTerm();
      if (!term) return;
      editor.undoManager.transact(() => editor.dom.remove(term, true)); // unwrap, keep children
      fireChange();
    },
  });

  // Floating toolbar shown when the caret is on a tagged term.
  editor.ui.registry.addContextToolbar('onrr-glossary', {
    predicate: isTerm,
    items: 'glossary-edit glossary-unlink',
    position: 'node',
    scope: 'node',
  });

  return {
    getMetadata: () => ({
      name: 'ONRR Glossary'
    })
  }
});

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import { EditorState, Compartment } from '@codemirror/state';
import { EditorView, lineNumbers } from '@codemirror/view';
import {
  defaultHighlightStyle, syntaxHighlighting, indentOnInput,
  bracketMatching, foldGutter, foldKeymap
} from "@codemirror/language"
import {
  autocompletion, completionKeymap, closeBrackets,
  closeBracketsKeymap
} from "@codemirror/autocomplete"
import { history } from '@codemirror/commands';
import { html } from '@codemirror/lang-html';

const props = defineProps({
  modelValue: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  height: { type: [Number, String], default: 220 },
});
const emit = defineEmits(['update:modelValue']);

const mountEl = ref(null);
let language = null;
let view = null;

const editorTheme = (h) => {
  const v = typeof h === 'number' ? `${h}px` : h;
  return EditorView.theme({
    '&': {
      border: 'var(--theme--border-width) solid var(--theme--form--field--input--border-color)',
      borderRadius: 'var(--theme--border-radius)',
      height: v,
      overflow: 'hidden',
    },
    '&:hover': {
      borderColor: 'var(--theme--form--field--input--border-color-hover)',
    },
    '.cm-scroller': {
      overflow: 'auto',
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
      fontSize: '13px',
      lineHeight: '1.45',
    },
    '.cm-gutters.cm-gutters-before': {
      borderRightWidth: '0',
    },
    '.cm-gutter': {
      backgroundColor: 'var(--theme--form--field--input--background-subdued)',
      borderRight: 'var(--theme--border-width) solid var(--theme--form--field--input--border-color)',
      width: '3rem',
      color: 'var(--theme--foreground-subdued)',
    },
    '&.cm-focused': {
      borderColor: 'var(--theme--form--field--input--border-color-focus)',
      outline: 'none',
    }
  });
};

onMounted(() => {
  language = new Compartment

  const state = EditorState.create({
    doc: props.modelValue || '',
    extensions: [
      lineNumbers(),
      syntaxHighlighting(defaultHighlightStyle),
      bracketMatching(),
      closeBrackets(),
      autocompletion(),
      indentOnInput(),
      history(),
      language.of(html()),
      editorTheme(props.height),
      EditorView.updateListener.of((u) => {
        if (u.docChanged) emit('update:modelValue', u.state.doc.toString());
      }),
      EditorView.editable.of(!props.disabled),
    ],
  });
  view = new EditorView({ state, parent: mountEl.value });
});

watch(() => props.modelValue, (next) => {
  if (!view) return;
  const current = view.state.doc.toString();
  const desired = typeof next === 'string' ? next : '';
  if (desired !== current) view.dispatch({ changes: { from: 0, to: current.length, insert: desired } });
});

watch(() => props.disabled, (d) => {
  if (!view) return;
  // simplest toggle without compartments
  view.contentDOM.setAttribute('contenteditable', d ? 'false' : 'true');
});

onBeforeUnmount(() => view?.destroy());
</script>

<template>
  <div ref="mountEl" class="input-code-mirror"/>
</template>

<style scoped lang="scss">
  .input-code-mirror {
    margin-left: 2rem;
    margin-right: 2rem;
  }
</style>
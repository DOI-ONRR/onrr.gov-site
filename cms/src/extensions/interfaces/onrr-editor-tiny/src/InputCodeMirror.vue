<!-- InputCodeMirror.vue (minimal, fixed) -->
<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import { EditorState } from '@codemirror/state';
import { EditorView, lineNumbers /* , gutter, GutterMarker */ } from '@codemirror/view';
import { history } from '@codemirror/commands';
// optional: import { html } from '@codemirror/lang-html';

const props = defineProps({
  modelValue: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  height: { type: [Number, String], default: 220 },
});
const emit = defineEmits(['update:modelValue']);

const mountEl = ref(null);
let view = null;

const heightTheme = (h) => {
  const v = typeof h === 'number' ? `${h}px` : h;
  return EditorView.theme({
    '&': { border: '1px solid var(--border-subdued)', borderRadius: '8px', height: v },
    '.cm-scroller': { overflow: 'auto', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: '13px', lineHeight: '1.45', padding: '8px' },
  });
};

onMounted(() => {
  const state = EditorState.create({
    doc: props.modelValue || '',
    extensions: [
      lineNumbers(),
      history(),
      heightTheme(props.height),
      // html(),
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

<template><div ref="mountEl" /></template>
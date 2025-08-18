<script setup>
import { onMounted, onBeforeUnmount, ref, watch, computed } from 'vue';

const props = defineProps({
  value: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  lineNumber: { type: Boolean, default: true },
  lineWrapping: { type: Boolean, default: true },
  // Point this to a CDN or a self-hosted base (see notes below)
  cmBaseUrl: { type: String, default: 'https://cdn.jsdelivr.net/npm/codemirror@5.65.16' },
});

const emit = defineEmits(['input']);

const cmRoot = ref(null);
let cm = null;

const stringValue = computed(() => props.value ?? '');

onMounted(async () => {
  if (!cmRoot.value) return;
  const CodeMirror = await ensureCodeMirror(props.cmBaseUrl);

  cm = CodeMirror(cmRoot.value, {
    value: stringValue.value,
    mode: 'htmlmixed',
    lineNumbers: props.lineNumber,
    lineWrapping: props.lineWrapping,
    readOnly: props.disabled ? 'nocursor' : false,
    placeholder: props.placeholder,
    matchBrackets: true,
  });

  cm.on('change', (_ins, ch) => {
    if (ch?.origin === 'setValue') return;
    emit('input', cm.getValue());
  });
});

onBeforeUnmount(() => { cm = null; });

watch(stringValue, (nv) => {
  if (!cm) return;
  if (cm.getValue() !== nv) {
    cm.setValue(nv);
    cm.setCursor({ line: 0, ch: 0 }); // optional
  }
});

watch(() => props.disabled, (d) => cm?.setOption('readOnly', d ? 'nocursor' : false));
watch(() => props.lineNumber, (ln) => cm?.setOption('lineNumbers', ln));
watch(() => props.lineWrapping, (lw) => cm?.setOption('lineWrapping', lw));

function loadScriptOnce(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[data-src="${src}"]`)) return resolve();
    const s = document.createElement('script');
    s.src = src; s.async = true; s.dataset.src = src;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(s);
  });
}

function loadCssOnce(href) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`link[data-href="${href}"]`)) return resolve();
    const l = document.createElement('link');
    l.rel = 'stylesheet'; l.href = href; l.dataset.href = href;
    l.onload = () => resolve();
    l.onerror = () => reject(new Error(`Failed to load CSS ${href}`));
    document.head.appendChild(l);
  });
}

async function ensureCodeMirror(base) {
  if (window.CodeMirror) return window.CodeMirror;

  // Core CSS + core JS + required modes/addon for htmlmixed
  await loadCssOnce(`${base}/lib/codemirror.css`);
  await loadScriptOnce(`${base}/lib/codemirror.js`);
  await loadScriptOnce(`${base}/mode/xml/xml.js`);
  await loadScriptOnce(`${base}/mode/javascript/javascript.js`);
  await loadScriptOnce(`${base}/mode/css/css.js`);
  await loadScriptOnce(`${base}/mode/htmlmixed/htmlmixed.js`);
  await loadScriptOnce(`${base}/addon/edit/matchbrackets.js`);

  return window.CodeMirror;
}
</script>

<template>
  <div class="input-code-lite">
    <div ref="cmRoot" class="cm-host" />
  </div>
</template>

<style scoped>
.input-code-lite { width: 100%; }
.cm-host :deep(.CodeMirror) {
  height: 320px;
  font-size: 14px;
}
</style>
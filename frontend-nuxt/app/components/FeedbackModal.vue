<template>
  <!--
    Native <dialog> + showModal() gives us the hard parts for free: focus trap, Esc to
    close, an inert background, a ::backdrop, and focus returned to the opener on close.
    The inner markup is a standard USWDS modal (.usa-modal). Opened imperatively by the
    parent via the exposed open().
  -->
  <dialog
    ref="dialogEl"
    class="feedback-dialog"
    aria-labelledby="feedback-modal-heading"
    @click="onDialogClick"
    @close="onNativeClose"
  >
    <div class="usa-modal">
      <div class="usa-modal__content">
        <div class="usa-modal__main">
          <h2 id="feedback-modal-heading" class="usa-modal__heading">
            Is this page helpful?
          </h2>
          <div class="usa-prose">
            <p>We&rsquo;d love your feedback about this page.</p>
          </div>
        </div>
        <button
          type="button"
          class="usa-button usa-modal__close"
          aria-label="Close this window"
          @click="requestClose"
        >
          <svg class="usa-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
          </svg>
        </button>
      </div>
    </div>
  </dialog>
</template>

<script setup>
// Controlled via v-model:open. The parent owns the boolean; this component mirrors it
// onto the native <dialog> (showModal/close) and emits update:open whenever the dialog
// is dismissed from inside (Esc, backdrop, or close button).
const props = defineProps({
  open: { type: Boolean, default: false },
})
const emit = defineEmits(['update:open'])

const dialogEl = ref(null)

// Reflect the `open` prop onto the real <dialog>. Guarded against redundant calls so the
// watch <-> emit round-trip can't double-toggle.
function sync(open) {
  const dlg = dialogEl.value
  if (!dlg) return
  if (open && !dlg.open) {
    dlg.showModal()
    document.body.style.overflow = 'hidden' // lock background scroll while open
  } else if (!open && dlg.open) {
    dlg.close()
  }
}

watch(() => props.open, sync)
onMounted(() => sync(props.open)) // in case it mounts already-open

function requestClose() {
  emit('update:open', false) // the watch then calls dialog.close()
}

// Native 'close' fires for Esc and programmatic close alike; release the scroll lock and
// keep the parent's model in sync (no-op if it's already false).
function onNativeClose() {
  document.body.style.overflow = ''
  emit('update:open', false)
}

// A click whose target is the <dialog> itself (the backdrop around the .usa-modal panel)
// dismisses it; clicks inside the panel bubble up with a different target.
function onDialogClick(event) {
  if (event.target === dialogEl.value) requestClose()
}

onBeforeUnmount(() => {
  document.body.style.overflow = ''
})
</script>

<style scoped>
/* The <dialog> is just a chromeless, centered container; the white panel is .usa-modal. */
.feedback-dialog {
  padding: 0;
  border: 0;
  background: transparent;
  max-width: 100%;
  max-height: 100vh;
  overflow: visible;
}

.feedback-dialog::backdrop {
  background: rgba(0, 0, 0, 0.7);
}
</style>

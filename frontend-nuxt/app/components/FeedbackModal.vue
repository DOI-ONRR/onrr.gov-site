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
          <!-- Submitted: success confirmation (mirrors the Touchpoints "received" message). -->
          <div v-if="status === 'success'" class="usa-alert usa-alert--success" role="status">
            <div class="usa-alert__body">
              <h3 class="usa-alert__heading">{{ successHeading }}</h3>
              <p class="usa-alert__text">{{ successText }}</p>
            </div>
          </div>

          <form v-else class="usa-form" @submit.prevent="submit">
            <fieldset class="usa-fieldset">
              <legend class="usa-legend">We'd love your feedback about this page.</legend>

              <div v-if="status === 'error'" class="usa-alert usa-alert--error usa-alert--slim margin-bottom-2" role="alert">
                <div class="usa-alert__body">
                  <p class="usa-alert__text">{{ errorMessage }}</p>
                </div>
              </div>

              <div class="usa-radio">
                <input
                  class="usa-radio__input usa-radio__input--tile"
                  id="feedback-yes"
                  type="radio"
                  name="feedback-helpful"
                  value="Yes"
                  v-model="helpful"
                />
                <label class="usa-radio__label" for="feedback-yes">Yes</label>
              </div>
              <div class="usa-radio">
                <input
                  class="usa-radio__input usa-radio__input--tile"
                  id="feedback-no"
                  type="radio"
                  name="feedback-helpful"
                  value="No"
                  v-model="helpful"
                />
                <label class="usa-radio__label" for="feedback-no">No</label>
              </div>

              <label class="usa-label margin-bottom-1" for="feedback-comments">Optional comments</label>
              <textarea
                class="usa-textarea width-full height-card"
                id="feedback-comments"
                name="feedback-comments"
                maxlength="10000"
                v-model="comments"
              ></textarea>
              <span class="usa-hint font-ui-2xs">Please do not include any personally identifiable information.</span>
            </fieldset>
            <ul class="usa-button-group">
              <li class="usa-button-group__item">
                <button type="submit" class="usa-button" :disabled="!helpful || status === 'submitting'">
                  {{ status === 'submitting' ? 'Submitting…' : 'Submit' }}
                </button>
              </li>
              <li class="usa-button-group__item">
                <button type="button" class="usa-button usa-button--outline" @click="requestClose">Cancel</button>
              </li>
            </ul>
          </form>
        </div>
        <button
          type="button"
          class="usa-button usa-modal__close"
          aria-label="Close this window"
          @click="requestClose"
        >
          <svg class="usa-icon" aria-hidden="true" focusable="false" role="img">
            <use href="/uswds/img/sprite.svg#close"></use>
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

// Google Touchpoints "Is this page helpful?" form (id 2dcadeaf). The legacy site embedded
// the Touchpoints widget (/2dcadeaf.js) and let it POST; here we submit our own modal form
// to the same endpoint with the payload that widget's ajaxPost builds.
const TOUCHPOINTS_URL = 'https://touchpoints.app.cloud.gov/touchpoints/2dcadeaf/submissions.json'

const helpful = ref('') // 'Yes' | 'No' -> answer_01
const comments = ref('') //             -> answer_02
const status = ref('idle') // 'idle' | 'submitting' | 'success' | 'error'
const errorMessage = ref('')

// Confirmation copy — defaults, overwritten from the Touchpoints response (form.success_*).
const successHeading = ref('Success')
const successText = ref('Thank you. Your feedback has been received.')

const { trackEvent } = useAnalytics()

function resetForm() {
  helpful.value = ''
  comments.value = ''
  status.value = 'idle'
  errorMessage.value = ''
}

async function submit() {
  if (!helpful.value) {
    status.value = 'error'
    errorMessage.value = 'Please choose Yes or No.'
    return
  }
  status.value = 'submitting'
  errorMessage.value = ''
  try {
    // Matches the Touchpoints widget's ajaxPost: POST { submission: {...} } as JSON. The
    // endpoint is cross-origin and accepts anonymous submissions (no cookies / CSRF token).
    const res = await fetch(TOUCHPOINTS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        submission: {
          answer_01: helpful.value,
          answer_02: comments.value,
          answer_03: window.location.pathname + window.location.search, // current path incl. query string
          referer: document.referrer,
          hostname: window.location.hostname,
          page: window.location.pathname,
          location_code: null,
          fba_directive: null,
          language: 'en',
        },
      }),
    })
    if (!res.ok) throw new Error(`Touchpoints responded ${res.status}`)
    // Use the confirmation copy configured in Touchpoints, falling back to our defaults.
    const form = await res.json().then((d) => d?.submission?.form).catch(() => null)
    if (form?.success_text_heading) successHeading.value = form.success_text_heading
    if (form?.success_text) successText.value = form.success_text
    status.value = 'success'
    // Custom analytics event (no free-text — avoid sending PII to GTM/GA).
    trackEvent('feedback_submit', {
      feedback_helpful: helpful.value,
      feedback_has_comment: comments.value.trim().length > 0,
      page_path: window.location.pathname + window.location.search,
    })
  } catch {
    status.value = 'error'
    errorMessage.value = 'Sorry, your feedback could not be sent. Please try again.'
  }
}

// Reflect the `open` prop onto the real <dialog>. Guarded against redundant calls so the
// watch <-> emit round-trip can't double-toggle.
function sync(open) {
  const dlg = dialogEl.value
  if (!dlg) return
  if (open && !dlg.open) {
    resetForm() // start each session fresh (clears a prior success/error state)
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

/*
  Keep the footer buttons at their natural height. The modal (.usa-modal__main) raises the
  inherited line-height, which inflates the line box that each inline-flex .usa-button sits in,
  making the .usa-button-group__item ~63px tall. The button group's equalize rules
  (align-items: stretch + .usa-button-group__item .usa-button { height: 100% }) then stretch the
  buttons to that height. Opting out of height: 100% lets them size to their own content.
*/
.usa-button-group .usa-button {
  height: auto;
}
</style>

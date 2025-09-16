export function createTinyConfig() {
  const base = {
    toolbar: 'bold italic underline h1 h2 h3 onrr-table numlist bullist removeformat blockquote onrr-link image code',
    plugins: 'lists image code onrr-link onrr-table table',
    external_plugins: {
      onrrLink: '/wysiwyg-static/plugins/link.js',
      onrrTable: '/wysiwyg-static/plugins/table.js'
    },
    menubar: false,
    promotion: false,
    branding: false,
    statusbar: false,
    relative_urls: false,
    skin: 'default',
    content_css: 'default',
    ui_mode: 'split',
    object_resizing: false,
  }

  return { ...base }
}

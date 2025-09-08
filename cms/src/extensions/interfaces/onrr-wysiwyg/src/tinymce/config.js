export function createTinyConfig() {
  const base = {
    toolbar: 'bold italic underline h1 h2 h3 numlist bullist removeformat blockquote onrr-link image code',
    plugins: 'lists image table code onrr-link',
    external_plugins: {
      onrrLink: '/wysiwyg-static/plugins/link.js'
    },
    menubar: false,
    promotion: false,
    branding: false,
    statusbar: false,
    relative_urls: false,
    skin: 'default',
    content_css: 'default',
  }

  return { ...base }
}

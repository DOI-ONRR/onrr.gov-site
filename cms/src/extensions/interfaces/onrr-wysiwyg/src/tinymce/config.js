export function createTinyConfig() {
  const base = {
    base_url: '/wysiwyg-static/tinymce',
    suffix: '.min',
    skin_url: '/wysiwyg-static/tinymce/skins/ui/default',
    content_css: ['/wysiwyg-static/tinymce/skins/ui/default/content.min.css'],
    toolbar: 'bold italic underline blocks forecolor | alignleft aligncenter alignright | onrr-table numlist bullist hr removeformat blockquote onrr-link image code',
    plugins: 'lists image code onrr-link onrr-table table',
    external_plugins: {
      "onrr-link": '/wysiwyg-static/plugins/link.js',
      "onrr-table": '/wysiwyg-static/plugins/table.js'
    },
    block_formats: 'Paragraph=p; Heading 1=h1; Heading 2=h2; Heading 3=h3; Heading 4=h4; Heading 5=h5; Heading 6=h6',
    color_map_foreground:[
      '#848484ff', 'Blue', 
      '#D83933', 'Red', 
      '#C05500', 'Orange', 
      '#005024', 'Green'
    ],
    menubar: false,
    promotion: false,
    branding: false,
    statusbar: false,
    relative_urls: false,
    ui_mode: 'split',
    object_resizing: false,
    table_toolbar: 'tablecaption tabledelete | tableinsertrowafter tableinsertrowbefore tabledeleterow | tableinsertcolafter tableinsertcolbefore tabledeletecol | tablerowheader tablecolheader'
  }

  return { ...base }
}

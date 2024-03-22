import { examplePlugin } from './plugins/example'

const config = {
    toolbar: 'lists link image table code example',
    plugins: 'example lists link image table code help wordcount',
    menubar: false,
    promotion: false,
    branding: false,
    setup: function () {
        window.tinymce.PluginManager.add('example', examplePlugin)
    }
}

export default { config }
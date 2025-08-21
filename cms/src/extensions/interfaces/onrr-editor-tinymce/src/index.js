import InterfaceComponent from './interface.vue'
export default {
  id: 'onrr-editor-tinymce',
  name: 'ONRR Editor (TinyMCE)',
  icon: 'wysiwyg',
  description: 'ONRR rich text editor using TinyMCE',
  component: InterfaceComponent,
  types: ['text', 'string'],
  relational: true,
  options: [
    {
      field: 'bordered',
      name: 'Border',
      type: 'boolean',
      meta: {
        width: 'half',
        interface: 'toggle'
      },
      schema: {
        default_value: true
      }
    }
  ]
}

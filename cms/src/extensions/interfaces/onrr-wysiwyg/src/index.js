import InterfaceComponent from './interface.vue'
export default {
  id: 'onrr-wysiwyg',
  name: 'ONRR WYSIWYG',
  icon: 'wysiwyg',
  description: 'ONRR WYSIWYG using TinyMCE',
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

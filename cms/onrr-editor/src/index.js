import InterfaceComponent from './interface.vue'

export default {
  id: 'onrr-editor',
  name: 'ONRR Editor',
  icon: 'wysiwyg',
  description: 'ONRR rich text editor',
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

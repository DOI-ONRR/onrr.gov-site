<template>
  <div>
    <v-text-field
      v-if="inputType === 'text'"
      outlined
      clearable
      dense
      color="secondary"
      :append-icon="icon"
      :label="label"
      :type="type"
      :value="value"
      @input="$emit('update', $event)"
    ></v-text-field>

     <v-select
      v-if="inputType === 'select'"
      outlined
      dense
      color="secondary"
      append-icon="mdi-chevron-down"
      :items="items"
      :label="label"
      :type="type"
      :value="value"
      @input="$emit('update', $event)"
    ></v-select>
  </div>
</template>

<script>

const TYPES = [
  'text',
  'password',
  'email',
  'number',
  'url',
  'tel',
  'search',
  'color'
]

const includes = types => type => types.includes(type);

export default {
  name: 'CustomInput',
  inheritAttrs: false,
  props: {
    label: {
      type: String,
      default: ''
    },
    value: {
      type: [String, Number],
      default: ''
    },
    inputType: {
      type: String,
      default: ''
    },
    icon: {
      type: String,
      default: '',
    },
    items: {
      type: [Array]
    },
    type: {
      type: String,
      default: 'text',
      validator(value) {
        const isValid = includes(TYPES)(value);
        if (!isValid) {
          // eslint-disable-next-line
          console.warn(`allowed types are ${TYPES}`);
        }
        return isValid;
      }
    }
  },
  model: {
    prop: 'value',
    event: 'update'
  }
}
</script>
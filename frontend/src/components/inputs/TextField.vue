<template>
    <div>
        <v-text-field
            outlined
            clearable
            dense
            v-model="field.text"
            :color="field.color"
            :append-icon="field.icon"
            :label="field.label"
            :ref="field.ref"
            @input="$emit('update', $event)"></v-text-field>
    </div>
</template>

<script>
export default {
    name: 'TextField',
    props: ['fields'],
    data() {
        return {
            field: this.fields
        }
    },
    created() {
        this.$emit('fields', this.field)
    }
}
</script>
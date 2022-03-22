<template>
    <div>
        <v-select
            outlined
            dense
            v-model="field.selected"
            clearable
            :items="field.items"
            :value="field.selected"
            :color="field.color"
            :append-icon="field.icon"
            :label="field.label"
            :ref="field.ref"
            @input="$emit('update', $event)"
            @change="addParamsToLocation({ [field.params]: field.selected || undefined })" ></v-select>
    </div>
</template>

<script>
export default {
    name: 'SelectField',
    props: ['fields'],
    data() {
        return {
            field: this.fields
        }
    },
    methods: {
        addParamsToLocation(params) {
            const query = { path: this.$route.fullPath, ...this.$route.query, query: params }
            this.$router.push(query).catch(() => {})
        },
    },
    created() {
        this.$emit('fields', this.field)
    }
}
</script>
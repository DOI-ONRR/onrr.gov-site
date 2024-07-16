<template>
    <div>
        <v-select
            outlined
            dense
            v-model="field.selected"
            v-bind:clearable="field.clearable || undefined"
            :items="field.items"
            :value="field.selected"
            :color="field.color"
            :append-icon="field.icon"
            :label="field.label"
            :ref="field.ref"
            @input="$emit('update', $event)"
            @change="field.selected !== null ? addParamsToLocation({ [field.params]: field.selected || undefined }) : removeParamsToLocation(field.params)" ></v-select>
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
        removeParamsToLocation(params) {
            const query = Object.assign({}, this.$route.query)
            delete query[params]
            this.$router.replace({ query })
        },
    },
    created() {
        this.$emit('fields', this.field)
    }

}
</script>
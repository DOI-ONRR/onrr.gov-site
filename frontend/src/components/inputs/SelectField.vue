<template>
    <div>
        <v-select
            outlined
            dense
            v-model="field.selected"
            :items="field.items"
            :value="field.selected"
            :color="field.color"
            :append-icon="field.icon"
            :label="field.label"
            :ref="field.ref"
            @input="$emit('update', $event)"
            @change="addParamsToLocation({ [field.params]: field.selected })" ></v-select>
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
            this.$router.replace({ path: this.$route.path, query: params })
            // this.forceRerender()
        },
    },
    created() {
        this.$emit('fields', this.field)
    }
}
</script>
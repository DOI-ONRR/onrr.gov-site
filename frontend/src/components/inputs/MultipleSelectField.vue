<template>
    <div>
        <v-select
            outlined
            dense
            multiple
            small-chips
            v-model="field.selected"
            :items="field.items"
            :color="field.color"
            :item-color="field.color"
            :append-icon="field.icon"
            :label="field.label"
            :ref="field.ref"
            max-width="250px"
            @input="$emit('update', $event)"
            @change="addParamsToLocation({ [field.params]: (field.selected.length > 0) ? field.selected.join(',') : undefined })" >
        </v-select>
    </div>
</template>

<script>
export default {
    name: 'MultipleSelectField',
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
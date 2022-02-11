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
            @change="(field.selected.length > 0) && addParamsToLocation({ [field.params]: field.selected.join(',') })" >
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
            this.$router.replace({ path: this.$route.path, query: params })
            // this.forceRerender()
        },
    },
    created() {
        this.$emit('fields', this.field)
    }
}
</script>
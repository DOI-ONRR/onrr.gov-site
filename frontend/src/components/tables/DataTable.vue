<template>
    <v-card>
        <v-card-title>

        <v-spacer></v-spacer>
        </v-card-title>
        <v-data-table
        :headers="field.headers"
        :items="field.items"
        item-key="title">
        </v-data-table>
    </v-card>
</template>

<script>
export default {
    name: 'DataTable',
    props: ['fields'],
    data() {
        return {
            field: this.fields
        }
    },
    created() {
        console.log('the value of field:- '+JSON.stringify(this.field));
        this.$emit('fields', this.field)
    }
}
</script>
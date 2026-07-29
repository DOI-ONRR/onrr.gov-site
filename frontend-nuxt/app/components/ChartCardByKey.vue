<!--
  ChartCardByKey — renders a `chart_cards` item by its `key` field, wherever it's
  placed in a page template. Drop `<ChartCardByKey chart-key="some-key" />` where the
  chart should appear; the key both identifies the card and marks its location.
-->
<script setup>
import getChartCardByKey from '@/graphql/queries/collections/chart_cards/getChartCardByKey.gql'

const props = defineProps({
  chartKey: { type: String, required: true },
})

const { data } = await useAsyncQuery(getChartCardByKey, { key: props.chartKey })
const card = computed(() => data.value?.chart_cards?.[0] ?? null)
</script>

<template>
  <ChartCard v-if="card" :block="card" />
</template>

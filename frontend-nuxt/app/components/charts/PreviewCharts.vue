<script setup>
/*
  PreviewCharts — renders a set of chart-section descriptors published by a dataset preview
  (via the `datasetPreviewCharts` injection), so filter-reactive charts can live in the #chart
  section ABOVE the "Preview and filter" heading. Each section is either a `small-multiples`
  grid (one self-scaled MiniLineChart per pane) or a single `lines` chart.
*/
defineProps({
  // [{ kind:'small-multiples'|'lines', title, note?, categories, valueFormat, showLegend?,
  //    panes?:[{title, series, height?}], series?, height? }]
  sections: { type: Array, default: () => [] },
})
</script>

<template>
  <div class="preview-charts">
    <section v-for="(s, i) in sections" :key="s.title || i" class="preview-chart-section">
      <h3 class="font-heading-sm margin-y-0">{{ s.title }}</h3>
      <p v-if="s.note" class="preview-chart-note margin-top-05 margin-bottom-1">{{ s.note }}</p>

      <div v-if="s.kind === 'small-multiples'" class="preview-small-multiples">
        <div v-for="pane in s.panes" :key="pane.title" class="preview-sm-pane">
          <p class="preview-sm-title margin-0">{{ pane.title }}</p>
          <MiniLineChart :categories="s.categories" :series="pane.series" :value-format="s.valueFormat" :height="pane.height || 170" />
        </div>
      </div>

      <MiniLineChart
        v-else
        :categories="s.categories"
        :series="s.series"
        :value-format="s.valueFormat"
        :height="s.height || 340"
        :show-legend="!!s.showLegend"
      />
    </section>
  </div>
</template>

<style lang="scss" scoped>
.preview-chart-section { margin-bottom: 1.5rem; }
.preview-chart-section:last-child { margin-bottom: 0; }
.preview-chart-note { font-size: 0.85rem; color: #565c65; }
.preview-small-multiples {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: 0.75rem 1rem;
}
.preview-sm-pane {
  border: 1px solid #dfe1e2;
  border-radius: 4px;
  padding: 0.25rem 0.5rem 0.5rem;
  background: #fff;
}
.preview-sm-title { font-weight: 700; font-size: 0.9rem; padding: 0.25rem 0.25rem 0; }
</style>

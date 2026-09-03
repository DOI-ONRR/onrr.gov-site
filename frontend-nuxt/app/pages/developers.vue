<script setup>
/*
  Data API (`/developers`) — public developer reference for the open, read-only REST API
  over the disbursement / revenue / production datasets. A dedicated static route (not a
  CMS page template) because it's a singular reference page: overview, endpoint table,
  column reference, query DSL, and runnable examples.

  The public endpoints (data.onrr.gov/<name>) are mapped by the route-service onto the
  denormalized flat collections in the CMS (disbursement_flat / revenue_flat /
  production_flat), which are created by a migration and kept fresh by the
  revenue-data-update hook. The `_flat` collections and Directus's `/items/` prefix are
  internal — consumers only ever see the friendly names. Example links are built from the
  runtime `dataApiBase` so they point at the documented public host.
*/
const { dataApiBase } = useRuntimeConfig().public

useHead({
  title: 'Data API — ONRR',
  meta: [
    {
      name: 'description',
      content:
        'Open, read-only REST API for ONRR disbursement, revenue, and production data. ' +
        'No account or API key required.',
    },
  ],
})

// On-this-page navigation.
const toc = [
  { id: 'overview', label: 'Overview' },
  { id: 'endpoints', label: 'Endpoints' },
  { id: 'columns', label: 'Columns' },
  { id: 'querying', label: 'Querying' },
  { id: 'examples', label: 'Examples' },
  { id: 'downloads', label: 'Bulk downloads' },
  { id: 'caching', label: 'Caching & limits' },
  { id: 'notes', label: 'Notes' },
  { id: 'contact', label: 'Contact' },
]

const endpoints = [
  { name: 'Monthly disbursements', path: '/disbursements', measure: 'amount (USD)' },
  { name: 'Revenue', path: '/revenue', measure: 'amount (USD)' },
  { name: 'Production', path: '/production', measure: 'volume' },
]

// Columns shared by all three collections.
const sharedCols = [
  ['id', 'uuid', 'Unique row identifier.'],
  ['period_date', 'date', 'First day of the reporting month (YYYY-MM-DD).'],
  ['calendar_year', 'integer', 'Calendar year of the period.'],
  ['fiscal_year', 'integer', 'Federal fiscal year of the period.'],
  ['month_long', 'string', 'Full month name, e.g. "January".'],
  ['period_type', 'string', 'Reporting period: Monthly, Calendar Year, or Fiscal Year.'],
  ['state', 'string', 'Two-letter state code (blank for offshore).'],
  ['state_name', 'string', 'Full state name (blank for offshore).'],
  ['county', 'string', 'County, parish, or borough (blank for offshore).'],
  ['land_category', 'string', 'Onshore or Offshore.'],
  ['land_type', 'string', 'Land ownership / jurisdiction detail.'],
  ['commodity', 'string', 'Commodity that generated the record.'],
  ['product', 'string', 'Product detail within the commodity.'],
  ['unit', 'string', 'Unit for the measure (e.g. dollars, bbl, mcf).'],
]

// Per-dataset additional columns (labeled by the public endpoint, not the internal table).
const perDataset = [
  {
    coll: '/disbursements',
    cols: [
      ['fund_type', 'string', 'Type of recipient fund.'],
      ['fund_recipient', 'string', 'Specific recipient of the disbursement.'],
      ['fund_source', 'string', 'Source fund of the disbursement.'],
      ['disbursement_type', 'string', 'Category of disbursement (e.g. GOMESA, 8(g)).'],
      ['revenue_type', 'string', 'Revenue category behind the disbursement.'],
      ['amount', 'numeric', 'Amount disbursed, USD (can be negative).'],
    ],
  },
  {
    coll: '/revenue',
    cols: [
      ['fund_type', 'string', 'Type of fund the revenue was recorded against.'],
      ['revenue_type', 'string', 'Revenue category (e.g. Royalties, Rents, Bonuses).'],
      ['fund_source', 'string', 'Source fund of the revenue.'],
      ['amount', 'numeric', 'Revenue amount, USD (can be negative).'],
    ],
  },
  {
    coll: '/production',
    cols: [
      ['mineral_lease_type', 'string', 'Mineral lease type.'],
      ['volume', 'bigint', "Production volume, in the row's unit."],
    ],
  },
]

const params = [
  ['fields', 'Choose which columns to return (default: all).', 'fields=period_date,state_name,amount'],
  ['filter', 'Filter rows by column values.', 'filter[state_name][_eq]=Colorado'],
  ['sort', 'Order results; prefix - for descending.', 'sort=-period_date'],
  ['limit / offset', 'Page through results.', 'limit=100&offset=200'],
  ['meta', 'Include the total match count.', 'meta=filter_count'],
  ['aggregate / groupBy', 'Server-side rollups (sum, count, avg, min, max).', 'aggregate[sum]=amount&groupBy[]=calendar_year'],
  ['export', 'Download the result as a file.', 'export=csv'],
]

const operators = ['_eq', '_neq', '_in', '_gte', '_lte', '_between', '_null', '_contains']

const examples = [
  {
    title: 'Colorado disbursements in CY2024',
    desc: 'Newest first, first 100 rows.',
    path: '/disbursements?filter[state_name][_eq]=Colorado&filter[calendar_year][_eq]=2024&sort=-period_date&limit=100',
  },
  {
    title: 'Total disbursed by recipient, FY2024',
    desc: 'Server-side sum grouped by recipient.',
    path: '/disbursements?aggregate[sum]=amount&groupBy[]=fund_recipient&filter[fiscal_year][_eq]=2024',
  },
  {
    title: 'Oil production volume by state, CY2023',
    desc: 'Sum of volume grouped by state.',
    path: '/production?aggregate[sum]=volume&groupBy[]=state_name&filter[commodity][_eq]=Oil&filter[calendar_year][_eq]=2023',
  },
  {
    title: 'Row count for a filter',
    desc: 'No rows returned — just the total count.',
    path: '/revenue?filter[commodity][_eq]=Gas&limit=0&meta=filter_count',
  },
]

const downloads = [
  { desc: 'The entire disbursements dataset as CSV.', path: '/disbursements?export=csv' },
  {
    desc: 'A filtered, column-limited CSV slice.',
    path: '/disbursements?export=csv&filter[calendar_year][_eq]=2024&fields=period_date,state_name,fund_recipient,amount',
  },
]

const fullUrl = (path) => `${dataApiBase}${path}`

// Left-rail scroll spy + smooth-scroll, mirroring TopicView's "On this page" behavior:
// the active section is the last heading scrolled to within ~120px of the top.
const activeId = ref(toc[0].id)
function spy() {
  let current = toc[0].id
  for (const t of toc) {
    const el = document.getElementById(t.id)
    if (el && el.getBoundingClientRect().top < 120) current = t.id
  }
  activeId.value = current
}
function goToSection(id) {
  const el = document.getElementById(id)
  if (!el) return
  history.replaceState(null, '', `#${id}`)
  el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
onMounted(() => {
  spy()
  window.addEventListener('scroll', spy, { passive: true })
})
onBeforeUnmount(() => window.removeEventListener('scroll', spy))

// Copy-to-clipboard (client-only; no-op if the clipboard API is unavailable).
const copiedId = ref('')
async function copy(text, id) {
  try {
    await navigator.clipboard.writeText(text)
    copiedId.value = id
    setTimeout(() => {
      if (copiedId.value === id) copiedId.value = ''
    }, 1500)
  } catch (e) {
    /* clipboard unavailable — leave the visible URL for manual copy */
  }
}

const contactBlock = {
  heading: 'Questions or feedback?',
  body:
    '<p>Whether you\'re building an integration, hit an unexpected result, or spotted a ' +
    'discrepancy in the data, the ONRR data team is glad to help. Email us at ' +
    '<a class="usa-link" href="mailto:data@onrr.gov?subject=ONRR%20Data%20API">data@onrr.gov</a>.</p>' +
    '<p class="margin-top-2">To help us respond quickly, include the dataset and the full request URL.</p>',
}
</script>

<template>
  <div class="api-docs margin-top-4">
    <div class="grid-container">
      <Breadcrumbs :page="{ title: 'Data API' }" />
    </div>

    <div class="grid-container padding-bottom-6">
      <div class="grid-row grid-gap">
        <!-- On this page (left rail) — hidden below tablet -->
        <div class="tablet:grid-col-3 display-none tablet:display-block">
          <nav class="onpage" aria-label="On this page">
            <p class="onpage-title">On this page</p>
            <ul>
              <li v-for="t in toc" :key="t.id">
                <a
                  :href="`#${t.id}`"
                  :class="{ active: activeId === t.id }"
                  @click.prevent="goToSection(t.id)"
                >{{ t.label }}</a>
              </li>
            </ul>
          </nav>
        </div>

        <!-- Content -->
        <div class="tablet:grid-col-9">
          <!-- Overview -->
          <section id="overview" class="api-section">
            <h1 class="margin-bottom-1">Data API</h1>
            <p class="usa-intro">
              Open, read-only access to revenue data. No account, API key, or authentication is required.
            </p>
            <p>
              Each row includes relevant reference data — the period, location, fund, and commodity
              labels are all available. The datasets
              are rebuilt after each monthly data load.
            </p>

            <ul class="api-badges" aria-label="API at a glance">
              <li><span class="k">Method</span><span class="v">GET</span></li>
              <li><span class="k">Auth</span><span class="v">None</span></li>
              <li><span class="k">Formats</span><span class="v">JSON · CSV</span></li>
            </ul>

            <div class="api-callout">
              <p class="api-callout__label">Base URL</p>
              <div class="code-row">
                <code class="code-inline">{{ dataApiBase }}</code>
                <button type="button" class="copy-btn" @click="copy(dataApiBase, 'base')">
                  {{ copiedId === 'base' ? 'Copied' : 'Copy' }}
                </button>
              </div>
              <p class="api-callout__note margin-bottom-0">
                All paths below are relative to this base. The same datasets are also reachable
                at <code class="code-inline">onrr.gov/data/&lt;name&gt;</code>. GraphQL is not
                offered for these datasets — use REST; it's cached and simpler to support.
              </p>
            </div>
          </section>

          <!-- Endpoints -->
          <section id="endpoints" class="api-section">
            <h2>Endpoints</h2>
            <div class="table-scroll">
              <table class="usa-table usa-table--borderless width-full">
                <thead>
                  <tr>
                    <th scope="col">Dataset</th>
                    <th scope="col">Endpoint</th>
                    <th scope="col">Measure</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="e in endpoints" :key="e.path">
                    <td>{{ e.name }}</td>
                    <td><code class="code-inline">{{ e.path }}</code></td>
                    <td>{{ e.measure }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <!-- Columns -->
          <section id="columns" class="api-section">
            <h2>Columns</h2>
            <h3 class="margin-bottom-1">Shared by all datasets</h3>
            <div class="table-scroll">
              <table class="usa-table usa-table--borderless width-full">
                <thead>
                  <tr>
                    <th scope="col">Column</th>
                    <th scope="col">Type</th>
                    <th scope="col">Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="c in sharedCols" :key="c[0]">
                    <td><code class="code-inline">{{ c[0] }}</code></td>
                    <td class="text-no-wrap">{{ c[1] }}</td>
                    <td>{{ c[2] }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <template v-for="d in perDataset" :key="d.coll">
              <h3 class="margin-bottom-1">
                <code class="code-inline">{{ d.coll }}</code> also adds
              </h3>
              <div class="table-scroll">
                <table class="usa-table usa-table--borderless width-full">
                  <thead>
                    <tr>
                      <th scope="col">Column</th>
                      <th scope="col">Type</th>
                      <th scope="col">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="c in d.cols" :key="c[0]">
                      <td><code class="code-inline">{{ c[0] }}</code></td>
                      <td class="text-no-wrap">{{ c[1] }}</td>
                      <td>{{ c[2] }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </template>

            <p class="api-hint">
              Offshore rows have no <code class="code-inline">state</code> /
              <code class="code-inline">county</code> — check
              <code class="code-inline">land_category</code> /
              <code class="code-inline">land_type</code> instead.
            </p>
          </section>

          <!-- Querying -->
          <section id="querying" class="api-section">
            <h2>Querying</h2>
            <p>These endpoints accept the standard Directus REST query parameters:</p>
            <div class="table-scroll">
              <table class="usa-table usa-table--borderless width-full">
                <thead>
                  <tr>
                    <th scope="col">Parameter</th>
                    <th scope="col">Purpose</th>
                    <th scope="col">Example</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="p in params" :key="p[0]">
                    <td class="text-no-wrap"><code class="code-inline">{{ p[0] }}</code></td>
                    <td>{{ p[1] }}</td>
                    <td><code class="code-inline">{{ p[2] }}</code></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p class="margin-top-2">
              Common filter operators:
              <code v-for="op in operators" :key="op" class="code-inline op">{{ op }}</code>
              — combine them with <code class="code-inline">_and</code> /
              <code class="code-inline">_or</code>.
            </p>
          </section>

          <!-- Examples -->
          <section id="examples" class="api-section">
            <h2>Examples</h2>
            <p>Each example is a live request against this environment — click <strong>Run</strong> to see the JSON.</p>
            <div v-for="ex in examples" :key="ex.path" class="example">
              <div class="example__head">
                <h3 class="example__title">{{ ex.title }}</h3>
                <div class="example__actions">
                  <a class="usa-button usa-button--outline example__run" :href="fullUrl(ex.path)" target="_blank" rel="noopener">Run&nbsp;↗</a>
                  <button type="button" class="copy-btn" @click="copy(fullUrl(ex.path), ex.path)">
                    {{ copiedId === ex.path ? 'Copied' : 'Copy URL' }}
                  </button>
                </div>
              </div>
              <p class="example__desc">{{ ex.desc }}</p>
              <div class="code-block"><code>GET {{ ex.path }}</code></div>
            </div>
          </section>

          <!-- Bulk downloads -->
          <section id="downloads" class="api-section">
            <h2>Bulk downloads</h2>
            <p>
              For a full dataset or a large slice, use <code class="code-inline">export=csv</code>
              (or <code class="code-inline">xlsx</code> / <code class="code-inline">json</code>)
              rather than deep JSON pagination.
            </p>
            <div v-for="dl in downloads" :key="dl.path" class="example">
              <div class="example__head">
                <p class="example__desc margin-bottom-0">{{ dl.desc }}</p>
                <a class="usa-button usa-button--outline example__run" :href="fullUrl(dl.path)" target="_blank" rel="noopener">Download&nbsp;↗</a>
              </div>
              <div class="code-block"><code>GET {{ dl.path }}</code></div>
            </div>
          </section>

          <!-- Caching & limits -->
          <section id="caching" class="api-section">
            <h2>Caching &amp; rate limits</h2>
            <ul class="usa-list">
              <li>
                Responses are cached for about 30 minutes and refreshed automatically after
                each monthly data load. The <code class="code-inline">X-Cache-Status</code>
                response header shows <code class="code-inline">HIT</code> or
                <code class="code-inline">MISS</code>. Keeping query shapes consistent
                improves cache hit rates.
              </li>
              <li>
                The API is rate-limited to protect the service. Prefer a single
                filtered/aggregated query or a CSV export over many small paginated requests.
                Sustained abusive traffic may be throttled at the edge.
              </li>
            </ul>
          </section>

          <!-- Notes -->
          <section id="notes" class="api-section">
            <h2>Notes</h2>
            <ul class="usa-list">
              <li>
                <strong>Stability.</strong> This is a stable, versionless contract. Changes
                are additive — new columns or datasets may be added, and your existing
                requests keep working. Any breaking change (renaming or removing a column,
                changing a type) will be announced in advance with a deprecation window.
              </li>
              <li>
                Data reflects the most recent monthly publication;
                <code class="code-inline">period_date</code> is the first of the reporting
                month. Recent months may be preliminary.
              </li>
              <li>
                Amounts are in USD; production <code class="code-inline">volume</code> units
                are in the <code class="code-inline">unit</code> column (e.g.
                <code class="code-inline">bbl</code>, <code class="code-inline">mcf</code>).
                Values can be negative (adjustments).
              </li>
              <li>
                Field definitions for each dataset are also on its page under
                <strong>Data dictionary</strong>, e.g.
                <NuxtLink to="/revenue-data/monthly-disbursements" class="usa-link">Monthly disbursements</NuxtLink>.
              </li>
            </ul>
          </section>

          <!-- Contact -->
           <section id="contact" class="api-section">
            <ContactBox :block="contactBlock"/>
           </section>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use "onrr-colors" as *;
// uswds-theme forwards uswds-core functions/mixins (u-text, etc.) without emitting the
// full USWDS component CSS — matches TopicView and the rest of the codebase.
@use "uswds-theme" as *;

// Section spacing + anchor-jump offset so headings aren't clipped under the sticky header.
.api-section {
  scroll-margin-top: 1.5rem;

  & + .api-section {
    margin-top: 2.5rem;
  }

  h2 {
    border-bottom: 2px solid #aeb9c2;
    padding-bottom: 0.25rem;
    margin-bottom: 1rem;
  }

  h3 {
    margin-top: 1.5rem;
    font-size: 1.05rem;
  }

  p {
    max-width: 68ch;
  }
}

// At-a-glance badges.
.api-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 1.25rem 0;
  padding: 0;
  list-style: none;

  li {
    display: flex;
    align-items: stretch;
    border: 1px solid #dfe1e2;
    border-radius: 4px;
    overflow: hidden;
    font-size: 0.85rem;
  }
  .k {
    background: #f0f0f0;
    color: #565c65;
    padding: 0.25rem 0.6rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }
  .v {
    padding: 0.25rem 0.6rem;
    font-weight: 700;
    color: $onrr-navy;
  }
}

// Base-URL callout.
.api-callout {
  border-left: 4px solid $onrr-blue;
  background: $onrr-blue-light;
  border-radius: 0 4px 4px 0;
  padding: 1rem 1.25rem;
  margin: 1.5rem 0;

  &__label {
    margin: 0 0 0.4rem;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: $onrr-navy;
  }
  &__note {
    font-size: 0.9rem;
    color: #3d4551;
    margin-top: 0.6rem;
    max-width: none;
  }
}

// Inline + block code.
.code-inline {
  font-family: "Roboto Mono", "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
  font-size: 0.88em;
  background: #f0f0f0;
  border: 1px solid #e6e6e6;
  border-radius: 3px;
  padding: 0.05rem 0.35rem;
  word-break: break-word;

  &.op {
    margin-right: 0.35rem;
  }
}

.code-block {
  background: $onrr-navy;
  border-radius: 4px;
  padding: 0.75rem 1rem;
  margin-top: 0.75rem;
  overflow-x: auto;

  code {
    font-family: "Roboto Mono", "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
    font-size: 0.85rem;
    color: #eef2f7;
    white-space: pre;
  }
}

.code-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;

  .code-inline {
    background: #fff;
  }
}

.copy-btn {
  flex-shrink: 0;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: $onrr-blue;
  background: transparent;
  border: 1px solid $onrr-blue;
  border-radius: 3px;
  padding: 0.2rem 0.55rem;
  cursor: pointer;

  &:hover {
    background: $onrr-blue-light;
  }
}

// Example / download cards.
.example {
  border: 1px solid #dfe1e2;
  border-radius: 4px;
  padding: 1rem 1.25rem;
  margin-top: 1rem;

  &__head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    flex-wrap: wrap;
  }
  &__title {
    margin: 0;
    font-size: 1rem;
  }
  &__actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-shrink: 0;
  }
  &__run {
    margin: 0;
    font-size: 0.8rem;
    padding: 0.3rem 0.75rem;
  }
  &__desc {
    color: #565c65;
    font-size: 0.92rem;
    margin: 0.4rem 0 0;
  }
}

.api-hint {
  font-size: 0.92rem;
  color: #565c65;
  background: #f9f9f9;
  border-radius: 4px;
  padding: 0.6rem 0.9rem;
  margin-top: 1rem;
}

.text-no-wrap {
  white-space: nowrap;
}

// Wide content (tables) scrolls within its own container.
.table-scroll {
  overflow-x: auto;
}

// "On this page" left rail — adopted verbatim from TopicView (learn-page mockup): sticky,
// gray left rail whose active-section segment turns blue via each link's own left border.
.onpage {
  position: sticky;
  top: 1rem;
  font-size: 0.9rem;
}

.onpage-title {
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #565c65;
  margin: 0 0 0.5rem;
}

.onpage ul {
  list-style: none;
  margin: 0;
  padding: 0;
  border-left: 3px solid #dfe1e2;
}

.onpage a {
  display: block;
  padding: 0.35rem 0.9rem;
  color: #565c65;
  text-decoration: none;
  border-left: 3px solid transparent;
  margin-left: -3px; // overlap the ul's rail so the active border replaces it
}

.onpage a:hover {
  @include u-text('primary');
  text-decoration: underline;
}

.onpage a.active {
  color: #1b1b1b;
  font-weight: 700;
  border-left-color: $onrr-blue;
}
</style>

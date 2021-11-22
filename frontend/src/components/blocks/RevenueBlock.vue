<template>
  <v-container>
    <v-row no-gutters>
      <v-col cols="12" sm="12" v-if="title">
        <h2 class="text-h2 mt-1 mb-3">{{ title }}</h2>
      </v-col>
      <v-col cols="12" sm="2">
        <NrrdOilRigIcon class="revenue-icon" />
      </v-col>
      <v-col cols="12" sm="10" class="text-body-1">
        <div class="text-body-1">Fiscal year {{ maxFiscalRevenueYear }} revenue: 
          <span style="font-weight: bold;">{{ formatToDollarInt(totalYearlyFiscalRevenue) }}</span>
        </div>
        <div class="text-body-1">Fiscal year {{ maxFiscalDisbursementYear }} disbursements: 
          <span style="font-weight: bold;">{{ formatToDollarInt(totalYearlyDisbursements) }}</span>
        </div>
        <div class="text-body-1">Fiscal year {{ maxFiscalDisbursementYear }} GOMESA disbursements: 
          <span style="font-weight: bold;">{{ formatToDollarInt(totalYearlyGoMesaDisbursements) }}</span><v-icon color="secondary" class="ml-2">mdi-file-pdf-box</v-icon><a href="https://www.onrr.gov/PDFDocs/GOMESA.National.Release.pdf">Press release</a>
        </div>
        <div class="text-body-1">
          <a href="https://revenuedata.doi.gov/">Explore Revenue Statistics</a><v-icon color="secondary" class="ml-2">mdi-launch</v-icon>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { TOTAL_REVENUE_QUERY } from '@/graphql/queries';
import { formatToDollarInt } from '@/js/utils'
import NrrdOilRigIcon from '@/assets/images/icons/nrrd-oil-rig.svg'


export default {
  name: 'RevenueBlock',
  data() {
    return {
      revenue_fiscal_years: '',
      disbursement_fiscal_years: '',
      total_yearly_fiscal_revenue: '',
      total_yearly_fiscal_disbursement: '',
      disbursement_gomesa: '',
    }
  },
  components: {
    NrrdOilRigIcon
  },
  apollo: {
    revenue_fiscal_years: {
      query: TOTAL_REVENUE_QUERY,
      loadingKey: 'loading....',
      client: 'b'
    },
    disbursement_fiscal_years: {
      query: TOTAL_REVENUE_QUERY,
      loadingKey: 'loading....',
      client: 'b'
    },
    total_yearly_fiscal_revenue: {
      query: TOTAL_REVENUE_QUERY,
      loadingKey: 'loading....',
      client: 'b'
    },
    total_yearly_fiscal_disbursement: {
      query: TOTAL_REVENUE_QUERY,
      loadingKey: 'loading....',
      client: 'b'
    },
    disbursement_gomesa: {
      query: TOTAL_REVENUE_QUERY,
      loadingKey: 'loading....',
      client: 'b'
    }
  },
  props: {
    title: String
  },
  computed: {
    maxFiscalRevenueYear () {
      return this.revenue_fiscal_years && this.revenue_fiscal_years[this.revenue_fiscal_years.length - 1].fiscal_year
    },
    maxFiscalDisbursementYear () {
      return this.disbursement_fiscal_years && this.disbursement_fiscal_years[this.disbursement_fiscal_years.length - 1].fiscal_year
    },
    totalYearlyFiscalRevenue () {
      return this.total_yearly_fiscal_revenue && this.total_yearly_fiscal_revenue.reduce((acc, key) => acc + key.sum, 0)
    },
    totalYearlyDisbursements () {
      return this.total_yearly_fiscal_disbursement && this.total_yearly_fiscal_disbursement.reduce((acc, key) => acc + key.sum, 0)
    },
    totalYearlyGoMesaDisbursements () {
      return this.total_yearly_fiscal_disbursement && this.disbursement_gomesa.reduce((acc, key) => acc + key.sum, 0)
    }
  },
  methods: {
    formatToDollarInt: function (value) {
      return formatToDollarInt(value)
    }
  }
}
</script>

<style lang="scss" scoped>
.revenue-icon {
  height: 100px;
}
</style>
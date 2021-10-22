<template>
  <v-container>
    <h2 class="text-h2 mt-1 mb-3">{{ title }}</h2>
    <div class="text-body-1">
      <p>Fiscal year {{ maxFiscalRevenueYear }} revenue: 
        <span style="font-weight: bold;">{{ formatToDollarInt(totalYearlyFiscalRevenue) }}</span>
      </p>
      <p>Fiscal year {{ maxFiscalDisbursementYear }} disbursements: 
        <span style="font-weight: bold;">{{ formatToDollarInt(totalYearlyDisbursements) }}</span>
      </p><a href="">Press release</a>
      <p>Fiscal year {{ maxFiscalDisbursementYear }} GOMESA disbursements: 
        <span style="font-weight: bold;">{{ formatToDollarInt(totalYearlyGoMesaDisbursements) }}</span>
      </p><a href="">Press release</a>
      <a href="https://revenuedata.doi.gov/">Explore Revenue Statistics</a>
    </div>
  </v-container>
</template>

<script>
import { TOTAL_REVENUE_QUERY } from '@/graphql/queries';
import { formatToDollarInt } from '@/js/utils'
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
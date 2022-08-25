import {
  getFullDate,
  getYear,
  getDay,
  getMonth
} from '@/js/utils'

export const dateMixin = {
  methods: {
    getFullDate: getFullDate,
    getYear: getYear,
    getMonth: getMonth,
    getDay: getDay,
    formatNiceDate(d) {
      return `${ getMonth(d, 'numeric') }/${ getDay(d, 'numeric') }/${ getYear(d) }`
    }
  }
}
import gql from 'graphql-tag'
import {
  pageFields,
  // fileCollectionFields
  // sectionHeadingBlocks,
  // contentBlocks,
  // cardBlocks,
  // tabBlocks
} from './fragments'

// Main menu query
export const MENU_QUERY = gql`query {
  menu_items {
    id
    menu_label
    custom_url
    menu
    link_to_page {
      id
      slug
      url
    }
    parent {
      id
      custom_url
      link_to_page {
        id
        slug
        url
      }
    }
  }
}`

// Announcements query
export const ANNOUNCEMENTS_QUERY = gql`query {
  announcements {
    id
    title 
    content
    status
  }
}`

// Pages query 
export const PAGES_QUERY = gql`
query {
  pages {
    id
    slug
    title
    url
  }
}`

// Redirects query
export const REDIRECTS_QUERY = gql`
query {
  redirects {
    id
    from 
    to
  }  
}
`

// Pages and Redirects queries
export const PAGES_REDIRECTS_QUERY = gql`
query {
  pages {
    id
    slug
    title
    url
  }
  redirects {
    id
    from 
    to
  }  
}
`

// Page by id query
export const PAGES_BY_ID_QUERY = gql`
${pageFields}
query PagesById($ID: ID!) {
  pages_by_id (id: $ID) {
    ...pageFields
  }
}`

// Home page query
export const HOME_PAGE_QUERY = gql`
${pageFields}
query PagesById($ID: ID!) {
  pages_by_id (id: $ID) {
    ...pageFields
    sidebar_blocks
  }
}`

// Files query
export const FILES_QUERY = gql`
  query {
    files {
      id
      storage
      filename_disk
      title
      filesize
      location
      folder {
        id 
        name
      }
    }
    folders {
      id
      name
    }
  }
`

// Total revenue queries
export const TOTAL_REVENUE_QUERY = gql`
  query {
    revenue_fiscal_years: period(
      distinct_on: fiscal_year, 
      where: {revenues: {revenue: {_is_null: false}, period: {period: {_eq: "Fiscal Year"}}}}, 
      order_by: {fiscal_year: asc}) {
        fiscal_year
    }

    disbursement_fiscal_years: period(
      distinct_on: fiscal_year, 
      where: {disbursements: {disbursement: {_is_null: false}, period: {period: {_eq: "Fiscal Year"}}}}, 
      order_by: {fiscal_year: asc}) {
        fiscal_year
    }
    total_yearly_fiscal_revenue(where: {year: {_eq: 2020}}) {
      sum
    }

    total_yearly_fiscal_disbursement(where: {year: {_eq: 2020}}) {
      sum
    }
    disbursement_gomesa: disbursement_source_summary(
      where: {fiscal_year: {_eq: "2020"}, source: {_eq: "GOMESA offshore"}, state_or_area: {_eq: "NF"}}, 
      order_by: {fiscal_year: asc, total: desc}
      ) {
      source
      sum: total
    }
  }
`

// Contacts query
export const CONTACTS_QUERY = gql`
  query {
    contacts {
      id
      status
      primary_contact
      primary_email
      primary_phone
    }
  }
`


// Press Release Query 
export const PRESS_RELEASES_QUERY = gql`
  query {
    press_releases {
      id
      title
      date
      file {
        id
      }
      link
      excerpt
      status
    }
  }
`

export const REPORTER_LETTERS_QUERY = gql`
  query {
    reporter_letters {
      id
      title
      date
      file {
        id
      }
      link
      status
    }
  }
`

// Events Query
export const EVENTS_QUERY = gql`
  query {
    events {
      id
      event_start_date_time
      event_end_date_time
      title
      description
      who_should_attend
      other_information
      contact {
        primary_contact
        primary_email
        primary_phone
      }
      location{
        street_address
        city
        state
        zip_code
      }
      }
  }
`
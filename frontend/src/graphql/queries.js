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
  menus {
    id
    custom_url
    link_to_page {
      id
      slug
      url
    }
    menu
    menu_children {
      pages_id {
        id
        title
        url
      }
    }
    menu_icon
    menu_label
  }
}`

// Announcements query
export const ANNOUNCEMENTS_QUERY = gql`query {
  announcements(sort: "sort") {
    id
    title 
    content
    status
  }
}`

// Pages query 
export const PAGES_QUERY = gql`
query {
  pages(limit: -1) {
    id
    slug
    title
    url
    template
    parent {
      id
    }
  }
}`

// Redirects query
export const REDIRECTS_QUERY = gql`
query {
  redirects(limit: -1) {
    id
    old_url
    new_url
  }  
}
`

// Pages and Redirects queries
export const PAGES_REDIRECTS_QUERY = gql`
query {
  pages(limit: -1 ) {
    id
    slug
    title
    url
  }
  redirects(limit: -1) {
    id
    old_url
    new_url
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
query HomePageQuery($ID: ID!) {
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
    contacts(sort: ["header", "letter"], limit: -1) {
      id
      status
      page
      tab
      accordion
      company_yn
      letter
      header
      company_name
      operator_number
      agency
      primary_contact
      primary_role
      email
      phone
      fax
      contact_2
      role_2
      email_2
      phone_2
      contact_3
      role_3
      email_3
      phone_3
      contact_4
      role_4
      email_4
      phone_4
      contact_5
      role_5
      email_5
      phone_5
      contact_6
      role_6
      email_6
      phone_6
    }
  }   
`

// NYMEX query
export const NYMEX_QUERY = gql`
  query {
    NYMEX(limit: -1) {
      id
      status
      date
      average
      roll
      Spreadsheet {
        id,
        filename_download
      }
    }
  }
`

// Press Release Query 
export const PRESS_RELEASES_QUERY = gql`
  query {
    press_releases(limit: -1) {
      id
      status
      title
      date
      file {
        id
        filename_download
        title
      }
      link
      excerpt
      status
    }
  }
`

export const REPORTER_LETTERS_QUERY = gql`
  query {
    reporter_letters(limit: -1) {
      id
      title
      date
      file {
        id
        filename_download
        title
        type
      }
      accessible_file {
        id
        filename_download
        title
        type
      }
      link
      status
      topics
    }
  }
`

export const RULEMAKINGS_QUERY = gql`
  query {
    rulemakings {
      id
      status
      final_publication_date
      rin
      rule_title
      informal_title
      commodity_subject_matter
      webpage_link
    }
  }
`

export const INDEX_ZONES_QUERY = gql`
  query {
    index_zones(sort: ["sort", "-date"], limit: -1) {
      id
      status
      date
      spreadsheet {
        id
        filename_download
        type
        title
      }
      index_zones
    }
  }
`

export const IBMP_QUERY = gql`
  query {
    ibmp(sort: ["sort", "-date"], limit: -1) {
      id
      status
      date
      spreadsheet {
          id
      }
      ibmp_line_items
    }
  }
`

export const INDIAN_GAS_MAJOR_PORTION_QUERY = gql`
  query {
    indian_gas_major_portion(sort: ["sort", "-date"], limit: -1) {
      id
      status
      date
      spreadsheet {
        id
      }
      index_zones
    }
  }
`
export const INTEREST_OIL_AND_GAS_QUERY = gql`
  query {
    Interest_Oil_and_Gas(sort: ["sort", "-sort"], limit: -1) {
      id
      sort
      status
      Period
      Indian_Late_and_Underpayments
      Federal_Late_and_Underpayments
      Federal_Overpayments
    }
  }
`
export const INTEREST_SOLIDS_QUERY = gql`
  query {
    Interest_Solids(sort: ["sort", "-sort"], limit: -1) {
      id
      sort
      status
      Period
      Federal_and_Indian_Late_and_Underpayments
    }
  }
`

export const SOLID_MINERALS_HANDBOOK_QUERY = gql`
  query {
    solid_minerals_handbook(limit: -1) {
      id
      status
      chapter
      section
      title
      actual_page
      toc_page
      url
    }
  }
`

export const PRODUCTION_HANDBOOK_QUERY = gql`
  query {
    production_handbook(limit: -1) {
      id
      status
      chapter
      section
      title
      actual_page
      toc_page
      url
    }
  }
`

export const REVENUE_HANDBOOK_QUERY = gql`
  query {
    revenue_handbook(limit: -1) {
      id
      status
      chapter
      section
      title
      actual_page
      toc_page
      url
    }
  }
`

export const GEOTHERMAL_CLASS_1_QUERY = gql`
  query {
    geothermal_class_1(limit: -1) {
      id
      status
      chapter
      section
      title
      actual_page
      toc_page
      url
    }
  }
`

export const GEOTHERMAL_CLASS_2_3_QUERY = gql`
  query {
    geothermal_class_2_3(limit: -1) {
      id
      status
      chapter
      section
      title
      actual_page
      toc_page
      url
    }
  }
`

export const PLANT_SPECIFIC_UCAS_QUERY = gql`
  query {
    plant_specific_ucas {
      id
      status
      transportation_system_or_gas_plant
      file {
        id
        filename_download
        type
        title
      }
      type
      operator
      location 
      doc_date
    }
  }
`

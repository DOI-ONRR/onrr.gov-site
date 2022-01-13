import { gql } from '@apollo/client'

export const contentBlocks = gql`
  fragment contentBlocks on content_blocks {
    content
  }
`

// export const blockFields = gql`
//   fragment blockFields on blocks {
//     id
//     block_label
//     block_type
//     block_layout
//     column_one
//     column_two
//     column_three
//     tab_items
//   }
// `

export const contentBlockFields = gql`
  fragment contentBlockFields on content_blocks {
    id
    block_label
    block_v_col
    block_content
    # block_layout
    # column_one
    # column_two
    # column_three
  }
`

export const cardBlockFields = gql`
  fragment cardBlockFields on card_blocks {
    id
    block_color
    block_label
    block_v_col
    block_content
    # block_collections
    # block_layout 
    # column_one
    # column_two
    # column_three
  }
`

export const tabBlockLabelFields = gql`
  fragment tabBlockLabelFields on tab_block_label {
    id
    tab_block_label
  }
`

// export const tabBlockFields = gql`
//   ${tabBlockLabelFields}
//   ${contentBlockFields}
//   ${cardBlockFields}
//   fragment tabBlockFields on tab_blocks {
//     id
//     tab_block_label
//     # block_v_col
//     # block_content
//     # tab_items
//     tab_blocks {
//       id
//       item {
//           __typename
//           ...tabBlockLabelFields
//           ...contentBlockFields
//           ...cardBlockFields
//           ...tabBlockContents
//       }
//     }
//   }
// `

export const sectionHeadingBlocks = gql`
  fragment sectionHeadingBlocks on section_heading_blocks {
    section_heading
    section_heading_type
  }
`

export const nestTabBlockFields = gql`
  ${tabBlockLabelFields}
  ${contentBlockFields}
  ${cardBlockFields}
  fragment nestedTabBlockFields on tab_blocks {
    id
    tab_blocks {
        id
        item {
          __typename
          ...tabBlockLabelFields
          ...contentBlockFields
          ...cardBlockFields
        }
    }
  }
`

export const tabBlockFields = gql`
  ${tabBlockLabelFields}
  ${contentBlockFields}
  ${cardBlockFields}
  ${nestTabBlockFields}
  fragment tabBlockFields on tab_blocks {
    id
    tab_blocks {
        id
        item {
          __typename
          ...tabBlockLabelFields
          ...contentBlockFields
          ...cardBlockFields
          ...nestedTabBlockFields
        }
    }
  }
`

export const pageFields = gql`
 ${contentBlockFields}
 ${tabBlockFields}
 ${cardBlockFields}
  fragment pageFields on pages {
    id
    title
    slug
    hero_image {
      id
    }
    hero_title
    page_blocks {
      id
      item {
        __typename
        ...contentBlockFields
        ...tabBlockFields
        ...cardBlockFields
      }
    }
    # page_builder
    meta_title
    meta_description
  }
`

export const cardBlocks = gql`
  ${contentBlocks}
  fragment cardBlocks on card_blocks {
    card_title
    card_subtitle
    card_content_block {
      item {
        __typename
        ...contentBlocks
      }
    }
  }
`

export const fileCollectionFields = gql`
  fragment fileCollectionFields on reporter_letters {
    id
    title
    date
    file {
        id
    }
  }
`

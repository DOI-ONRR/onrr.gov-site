import { gql } from 'apollo-boost'

export const contentBlocks = gql`
  fragment contentBlocks on content_blocks {
    content
  }
`

export const contentBlockFields = gql`
  fragment contentBlockFields on content_blocks {
    id
    block_label
    block_v_col
    block_content
    equal_col_height
  }
`

export const layoutColumnBlockFields = gql`
  fragment layoutColumnBlockFields on layout_column_blocks {
    id
    layoutCol: block_v_col
  }
`

export const cardBlockFields = gql`
  fragment cardBlockFields on card_blocks {
    id
    block_color
    block_label
    block_v_col
    block_icon
    block_content
    equal_col_height
    card_content_blocks {
      id
      item {
        ...contentBlockFields
      }
    }
  }
`

export const tabBlockLabelFields = gql`
  fragment tabBlockLabelFields on tab_block_label {
    id
    tab_block_label
  }
`

export const sectionHeadingBlocks = gql`
  fragment sectionHeadingBlocks on section_heading_blocks {
    section_heading
    section_heading_type
  }
`

export const expansionPanelBlockLabel = gql`
  fragment expansionPanelBlockLabel on expansion_panel_block_label {
    id
    block_label
  }
`

export const expansionPanelBlockFields = gql`
  ${expansionPanelBlockLabel}
  ${contentBlockFields}
  ${cardBlockFields}
  fragment expansionPanelBlockFields on expansion_panels {
    id
    block_label
    open_by_default {
      id
    }
    expansion_panel_blocks {
      id
      item {
        __typename
        ...expansionPanelBlockLabel
        ...contentBlockFields
        ...cardBlockFields
      }
    }
  }
`

export const nestedNestedTabBlockFields = gql`
  ${tabBlockLabelFields}
  ${contentBlockFields}
  ${cardBlockFields}
  ${expansionPanelBlockFields}
  ${layoutColumnBlockFields}
  fragment nestedNestedTabBlockFields on tab_blocks {
    id
    tab_blocks {
        id
        item {
          __typename
          ...tabBlockLabelFields
          ...contentBlockFields
          ...cardBlockFields
          ...expansionPanelBlockFields
          ...layoutColumnBlockFields
        }
    }
  }
`

export const nestedTabBlockFields = gql`
  ${tabBlockLabelFields}
  ${contentBlockFields}
  ${cardBlockFields}
  ${nestedNestedTabBlockFields}
  ${layoutColumnBlockFields}
  fragment nestedTabBlockFields on tab_blocks {
    id
    tab_blocks {
        id
        item {
          __typename
          ...tabBlockLabelFields
          ...contentBlockFields
          ...cardBlockFields
          ...nestedNestedTabBlockFields
          ...expansionPanelBlockFields
          ...layoutColumnBlockFields
        }
    }
  }
`

export const tabBlockFields = gql`
  ${tabBlockLabelFields}
  ${contentBlockFields}
  ${cardBlockFields}
  ${nestedTabBlockFields}
  ${expansionPanelBlockFields}
  ${layoutColumnBlockFields}
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
        ...expansionPanelBlockFields
        ...layoutColumnBlockFields
      }
    }
  }
`

export const pageFields = gql`
 ${contentBlockFields}
 ${tabBlockFields}
 ${cardBlockFields}
 ${expansionPanelBlockFields}
 ${layoutColumnBlockFields}
  fragment pageFields on pages {
    id
    title
    production
    slug
    hero_image {
      id
      description
    }
    hero_title
    page_blocks {
      id
      item {
        __typename
        ...contentBlockFields
        ...tabBlockFields
        ...cardBlockFields
        ...expansionPanelBlockFields
        ...layoutColumnBlockFields
      }
    }
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

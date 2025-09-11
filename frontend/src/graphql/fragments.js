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

export const formulaBlockFields = gql`
  fragment formulaBlockFields on formula_blocks {
    id
    title
    formula_tex
  }
`

export const wysiwygBlocksFields = gql`
  fragment wysiwygBlocksFields on wysiwyg_blocks {
    id
    title
    content
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
        ... on expansion_panel_block_label {
          ...expansionPanelBlockLabel
        }
        ... on content_blocks {
          ...contentBlockFields
        }
        ... on card_blocks {
          ...cardBlockFields
        }
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
  ${formulaBlockFields}
  fragment nestedNestedTabBlockFields on tab_blocks {
    id
    tab_blocks {
        id
        item {
          __typename
          ... on tab_block_label {
            ...tabBlockLabelFields
          }
          ... on content_blocks {
            ...contentBlockFields
          }
          ... on card_blocks {
            ...cardBlockFields
          }
          ... on expansion_panels {
            ...expansionPanelBlockFields
          }
          ... on layout_column_blocks {
            ...layoutColumnBlockFields
          }
          ... on formula_blocks {
            ...formulaBlockFields
          }
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
  ${formulaBlockFields}
  fragment nestedTabBlockFields on tab_blocks {
    id
    tab_blocks {
        id
        item {
          __typename
          ... on tab_block_label {
            ...tabBlockLabelFields
          }
          ... on content_blocks {
            ...contentBlockFields
          }
          ... on card_blocks {
            ...cardBlockFields
          }
          ... on tab_blocks {
            ...nestedNestedTabBlockFields
          }
          ... on expansion_panels {
            ...expansionPanelBlockFields
          }
          ... on layout_column_blocks {
            ...layoutColumnBlockFields
          }
          ... on formula_blocks {
            ...formulaBlockFields
          }
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
  ${formulaBlockFields}
  fragment tabBlockFields on tab_blocks {
    id
    tab_blocks {
      id
      item {
        __typename
        ... on tab_block_label {
          ...tabBlockLabelFields
        }
        ... on content_blocks {
          ...contentBlockFields
        }
        ... on card_blocks {
          ...cardBlockFields
        }
        ... on tab_blocks {
          ...nestedTabBlockFields
        }
        ... on expansion_panels {
          ...expansionPanelBlockFields
        }
        ... on layout_column_blocks {
          ...layoutColumnBlockFields
        }
        ... on formula_blocks {
          ...formulaBlockFields
        }
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
 ${formulaBlockFields}
 ${wysiwygBlocksFields}
  fragment pageFields on pages {
    id
    title
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
        ... on content_blocks {
          ...contentBlockFields
        }
        ... on tab_blocks {
          ...tabBlockFields
        }
        ... on card_blocks {
          ...cardBlockFields
        }
        ... on expansion_panels {
          ...expansionPanelBlockFields
        }
        ... on layout_column_blocks {
          ...layoutColumnBlockFields
        }
        ... on wysiwyg_blocks {
          ...wysiwygBlocksFields
        }
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

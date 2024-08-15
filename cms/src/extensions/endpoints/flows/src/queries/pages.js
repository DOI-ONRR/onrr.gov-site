import { gql } from 'graphql-request'

export const pagesById = gql`
query pages_by_id($id: ID!) {
    pages_by_id(id: $id) {
        id
        status
        sort
        published_on
        title
        content
        slug
        template
        meta_title
        meta_description
        url
        hero_title
        parent {
            id
        }
        sidebar_blocks
        page_builder
    }
}`;

export const createPagesItemMutation = gql`
mutation create_pages_item($data: create_pages_input!) {
    create_pages_item(
        data: $data
    ) {
        id
    }
}`;

export const createPagesPageBlocksItemsMutation = gql`
mutation create_pages_page_blocks_items($items: [create_pages_page_blocks_input!]) {
    create_pages_page_blocks_items(data: $items) {
        id
    }
}`;

export const pagesByIdDeepQuery = gql`
fragment CardBlockFields on card_blocks {
    id
    collection: __typename
    status
    block_label
    block_v_col
    block_color
    block_icon
    block_content
}

fragment ContentBlockFields on content_blocks {
    id
    collection: __typename
    status
    block_label
    block_v_col
    equal_col_height
    block_content
}

fragment ExpansionPanelBlockFields on expansion_panels {
    id
    collection: __typename
    status
    block_label
    block_v_col
    expansion_panel_blocks {
        item {
            ...CardBlockFields
            ...ContentBlockFields
            ...ExpansionPanelBlockLabelFields
        }
    }
}

fragment TabBlockLabelFields on tab_block_label {
    id
    collection: __typename
    tab_block_label
}

fragment ExpansionPanelBlockLabelFields on expansion_panel_block_label {
    id
    collection: __typename
    block_label
}

fragment TabBlockNestedFields on tab_blocks {
    id
    collection: __typename
    status
    tab_block_label
    block_v_col
    tab_blocks {
        item {
            ...CardBlockFields
            ...ContentBlockFields
            ...ExpansionPanelBlockFields
            ...TabBlockLabelFields
        }
    }
}

fragment TabBlockFields on tab_blocks {
    id
    collection: __typename
    status
    tab_block_label
    block_v_col
    tab_blocks {
        item {
            ...CardBlockFields
            ...ContentBlockFields
            ...ExpansionPanelBlockFields
            ...TabBlockLabelFields
            ...TabBlockNestedFields
        }
    }
}

query pages_by_id($id: ID!) {
    pages_by_id(id: $id) {
        id
        status
        sort
        published_on
        title
        content
        slug
        template
        meta_title
        meta_description
        url
        hero_title
        parent {
            id
        }
        sidebar_blocks
        page_builder
        page_blocks {
            id
            collection
            item {
                ...CardBlockFields
                ...ContentBlockFields
                ...ExpansionPanelBlockFields
                ...TabBlockFields
            }
        }
    }
}`;

export const pagesPageBlocks = gql`
query pages_page_blocks($pages_id: GraphQLStringOrFloat!) {
    pages_page_blocks(filter: { 
        pages_id: { 
            id: { 
                _eq: $pages_id 
            } 
        } 
    }) {
        id
        collection
        sort
    }
}`;

export const pagesPageBlocksItemByPageBlockId = gql`
query pages_page_blocks_item_by_page_block_id($id: ID!) {
    pages_page_blocks_by_id(id: $id) {
        item {
            ...on content_blocks {
                id
            }
            ...on tab_blocks {
                id
            }
            ...on card_blocks {
                id
            }
            ...on expansion_panels {
                id
            }
        }
    }
}`;

export const updatePagesItemMutation = gql`
mutation update_pages_item($id: ID!, $item: update_pages_input!) {
    update_pages_item(id: $id, data: $item) {
        id
        date_updated
    }
}`;
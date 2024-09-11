import { gql } from 'graphql-request';

export const tabBlocksById = gql`
query tab_blocks_by_id($id: ID!) {
    tab_blocks_by_id(id: $id) {
        id
        status
        tab_block_label
        block_v_col
    }
}`;

export const tabBlocksTabBlocks = gql`
query tab_blocks_tab_blocks($tabBlocksId: GraphQLStringOrFloat!) {
    tab_blocks_tab_blocks(
        filter: { tab_blocks_id: { id: { _eq: $tabBlocksId } } }
        sort: ["Sort"]
    ) {
        id
        tab_blocks_id {
            id
        }
        Sort
        item {
            ... on card_blocks {
                id
                collection: __typename
            }
            ... on content_blocks {
                id
                collection: __typename
            }
            ... on expansion_panels {
                id
                collection: __typename
            }
            ... on tab_block_label {
                id
                collection: __typename
            }
            ... on tab_blocks {
                id
                collection: __typename
            }
        }
    }
}`;

export const tabBlocksTabBlocksById = gql`
query tab_blocks_tab_blocks_by_id($id: ID!) {
    tab_blocks_tab_blocks_by_id(id: $id) {
        id
        tab_blocks_id {
            id
        }
        collection
        Sort
        item {
            ... on card_blocks {
                id
            }
            ... on content_blocks {
                id
            }
            ... on tab_blocks {
                id
            }
            ... on tab_block_label {
                id
            }
        }
    }
}
`;

export const tabBlockLabelById = `
query tab_block_label_by_id($id: ID!) {
    tab_block_label_by_id(id: $id) {
        id
        sort
        tab_block_label
    }
}`;

// *****************************************
// Mutations
// *****************************************

export const createTabBlocksItem = gql`
mutation create_tab_blocks_item($data: create_tab_blocks_input!) {
    create_tab_blocks_item(data: $data) {
        id
    }
}`;

export const createTabBlockLabel = gql`
mutation create_tab_block_label_item($data: create_tab_block_label_input!) {
    create_tab_block_label_item(data: $data) {
        id
    }
}`;

export const createTabBlocksTabBlocksItemMutation = gql`
mutation create_tab_blocks_tab_blocks_item($data: create_tab_blocks_tab_blocks_input!) {
    create_tab_blocks_tab_blocks_item(data: $data) {
        id
    }
}`;

export const createTabBlocksTabBlocksItems = gql`
mutation create_tab_blocks_tab_blocks_items($data: [create_tab_blocks_tab_blocks_input!]) {
    create_tab_blocks_tab_blocks_items(data: $data) {
        id
    }
}`;

export const updateTabBlockLabelItemMutation = gql`
mutation update_tab_block_label_item($id: ID!, $item: update_tab_block_label_input!) {
    update_tab_block_label_item(id: $id, data: $item) {
        id
        date_updated
    }
}`;

export const updateTabBlocksItemMution = gql`
mutation update_tab_blocks_item($id: ID!, $item: update_tab_blocks_input!) {
    update_tab_blocks_item(id: $id, data: $item) {
        id
        date_updated
    }
}`;

export const updateTabBlocksTabBlocksItemMutation = gql`
mutation update_tab_blocks_tab_blocks_item($id: ID!, $item: update_tab_blocks_tab_blocks_input!) {
    update_tab_blocks_tab_blocks_item(id: $id, data: $item) {
        id
    }
}
`;

export const deleteTabBlocksTabBlocksItemMutation = gql`
mutation delete_tab_blocks_tab_blocks_item($id: ID!) {
    delete_tab_blocks_tab_blocks_item(id: $id) {
        id
    }
}`;
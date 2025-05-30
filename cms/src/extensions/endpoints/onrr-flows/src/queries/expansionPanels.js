import { gql } from 'graphql-request';

export const expansionPanelsById = gql`
query expansion_panels_by_id($id: ID!) {
    expansion_panels_by_id(id: $id) {
        id
        status
        sort
        block_label
        block_v_col
    }
}`;

/* The variables take the following form:
{
    "expansion_panel_id": {
        _eq: 74
    }
}
*/
export const expansionPanelsExpansionPanelBlocks = gql`
query expansion_panels_expansion_panel_blocks(
    $expansion_panel_id: id_filter_operators!
) {
    expansion_panels_expansion_panel_blocks(
        filter: { expansion_panels_id: { id: $expansion_panel_id } }
    ) {
        id
        expansion_panels_id {
            id
        }
        collection
        sort
        item {
            ... on card_blocks {
                id
            }
            ... on content_blocks {
                id
            }
            ... on expansion_panel_block_label {
                id
            }
        }
    }
}`;

export const expansionPanelBlockLabelById = gql`
query expansion_panel_block_label_by_id($id: ID!) {
    expansion_panel_block_label_by_id(id: $id) {
        id
        sort
        block_label
    }
}`;

export const createExpansionPanelItemMutation = gql`
mutation create_expansion_panels_item($item: create_expansion_panels_input!) {
    create_expansion_panels_item(data: $item) {
        id
    }
}`;

export const updateExpansionPanelItemMutation = gql`
mutation update_expansion_panels_item($id: ID!, $item: update_expansion_panels_input!) {
    update_expansion_panels_item(id: $id, data: $item) {
        id
    }
}`;

export const createExpansionPanelBlockLabelItemMutation = gql`
mutation create_expansion_panel_block_label_item($data: create_expansion_panel_block_label_input!) {
    create_expansion_panel_block_label_item(data: $data) {
        id
    }
}`;

export const updateExpansionPanelBlockLabelItemMutation = gql`
mutation update_expansion_panel_block_label_item($id: ID!, $item: update_expansion_panel_block_label_input!) {
    update_expansion_panel_block_label_item(id: $id, data: $item) {
        id
    }
}`;

export const createExpansionPanelsExpansionPanelBlocksItemMutation = gql`
mutation create_expansion_panels_expansion_panel_blocks_item($item: create_expansion_panels_expansion_panel_blocks_input!) {
    create_expansion_panels_expansion_panel_blocks_item(data: $item) {
        id
    }
}`;

export const deleteExpansionPanelsExpansionPanelBlocksItemMutation = gql`
mutation delete_expansion_panels_expansion_panel_blocks_item($id: ID!) {
    delete_expansion_panels_expansion_panel_blocks_item(id: $id) {
        id
    }
}`;

export const updateExpansionPanelsExpansionPanelBlocksItemMutation = gql`
mutation update_expansion_panels_expansion_panel_blocks_item($id: ID!, $item: update_expansion_panels_expansion_panel_blocks_input!) {
    update_expansion_panels_expansion_panel_blocks_item(id: $id, data: $item) {
        id
    }
}`;
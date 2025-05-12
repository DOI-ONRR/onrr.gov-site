import { gql } from 'graphql-request';

export const cardBlocksById = gql`
query card_blocks_by_id($id: ID!) {
    card_blocks_by_id(id: $id) {
        id
        status
        sort
        column_one
        column_two
        column_three
        block_color
        block_label
        block_content
        block_v_col
        equal_col_height
        block_icon
    }
}`;

export const cardBlocksCardContentBlocks = gql`
query card_blocks_card_content_blocks($cardBlocksId: String!) {
    card_blocks_card_content_blocks(
        filter: { card_blocks_id: { id: { _eq: $cardBlocksId } } }
        sort: ["Sort"]
    ) {
        id
        card_blocks_id {
            id
        }
        item {
            ... on content_blocks {
                id
            }
        }
        collection
        Sort
    }
}`;

export const createCardBlocksItem = gql`
mutation create_card_blocks_item($data: create_card_blocks_input!) {
    create_card_blocks_item(data: $data) {
        id
    }
}`;

export const updateCardBlocksItemMutation = gql`
mutation update_card_blocks_item($id: ID!, $item: update_card_blocks_input!) {
    update_card_blocks_item(id: $id, data: $item) {
        id
        date_updated
    }
}`;

export const createCardBlocksCardContentBlocksItemMutation = gql`
mutation create_card_blocks_card_content_blocks_item($item: create_card_blocks_card_content_blocks_input!) {
    create_card_blocks_card_content_blocks_item(data: $item) {
        id
    }
}`;

export const deleteCardBlocksCardContentBlocksItemMutation = gql`
mutation delete_card_blocks_card_content_blocks_item($id: ID!) {
    delete_card_blocks_card_content_blocks_item(id: $id) {
        id
    }
}`;

export const updateCardBlocksCardContentBlocksItemMutation = gql`
mutation update_card_blocks_card_content_blocks_item($id: ID!, $item: update_card_blocks_card_content_blocks_input!) {
    update_card_blocks_card_content_blocks_item(id: $id, data: $item) {
        id
    }
}`;
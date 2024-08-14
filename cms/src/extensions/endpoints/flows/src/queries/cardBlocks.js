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

export const createCardBlocksItem = gql`
mutation create_card_blocks_item($data: create_card_blocks_input!) {
    create_card_blocks_item(data: $data) {
        id
    }
}`;
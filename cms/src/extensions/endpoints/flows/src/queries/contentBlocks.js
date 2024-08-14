import { gql } from 'graphql-request';

export const contentBlocksById = gql`
query content_blocks_by_id($id: ID!) {
    content_blocks_by_id(id: $id) {
        id
        status
        block_label
        column_one
        column_two
        column_three
        block_content
        block_v_col
        equal_col_height
    }
}`;

export const createContentBlocksItem = gql`
mutation create_content_blocks_item($data: create_content_blocks_input!) {
    create_content_blocks_item(data: $data) {
        id
    }
}`;
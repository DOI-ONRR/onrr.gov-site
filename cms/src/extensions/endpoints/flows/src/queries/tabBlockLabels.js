import { gql } from 'graphql-request';

export const createTabBlockLabel = gql`
mutation create_tab_block_label_item($data: create_tab_block_label_input!) {
    create_tab_block_label_item(data: $data) {
        id
    }
}`;
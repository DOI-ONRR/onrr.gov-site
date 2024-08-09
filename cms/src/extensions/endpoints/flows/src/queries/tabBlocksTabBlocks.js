import { gql } from 'graphql-request';

export const createTabBlocksTabBlocksItems = gql`
mutation create_tab_blocks_tab_blocks_items($data: [create_tab_blocks_tab_blocks_input!]) {
    create_tab_blocks_tab_blocks_items(data: $data) {
        id
    }
}`;
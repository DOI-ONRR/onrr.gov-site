import { gql } from 'graphql-request';

export const createContentBlocksItem = gql`
mutation create_content_blocks_item($data: create_content_blocks_input!) {
    create_content_blocks_item(data: $data) {
        id
    }
}`;
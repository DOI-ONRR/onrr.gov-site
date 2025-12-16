import { gql } from 'graphql-request';

export const getCollectionBlocksByIdQuery = gql`
query collection_blocks_by_id($id: ID!) {
    collection_blocks_by_id(id: $id) {
        id
        status
        sort
        collection
        layout
        items_per_page
        item_status
        description
        header
        page
        tab
        accordion
        category_header_level
        topics
    }
}`;

export const createCollectionBlocksItemQuery = gql`
mutation create_collection_blocks_item($data: create_collection_blocks_input!) {
    create_collection_blocks_item(data: $data) {
        id
    }
}`;

export const updateCollectionBlocksItemMutation = gql`
mutation update_collection_blocks_item($id: ID!, $item: update_collection_blocks_input!) {
    update_collection_blocks_item(id: $id, data: $item) {
        id
        date_updated
    }
}`;
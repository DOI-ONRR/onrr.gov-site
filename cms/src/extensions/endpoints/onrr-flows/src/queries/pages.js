import { gql } from 'graphql-request'

export const pagesByIdQuery = gql`
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
        hero_image {
            id
        }
        parent {
            id
        }
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

export const createPagesPageBlocksItemMutation = gql`
mutation create_pages_page_blocks_item($item: create_pages_page_blocks_input!) {
    create_pages_page_blocks_item(data: $item) {
        id
    }
}`;

export const deletePagesPageBlocksItemMutation = gql`
mutation delete_pages_page_blocks_item($id: ID!) {
    delete_pages_page_blocks_item(id: $id) {
        id
    }
}`;

export const updatePagesPageBlocksItemMutation = gql`
mutation update_pages_page_blocks_item($id: ID!, $item: update_pages_page_blocks_input!) {
    update_pages_page_blocks_item(id: $id, data: $item) {
        id
    }
}`;

// pages_sidebar_blocks queries:

export const createPagesSidebarBlocksItemMutation = gql`
mutation create_pages_sidebar_blocks_item($item: create_pages_sidebar_blocks_input!) {
    create_pages_sidebar_blocks_item(data: $item) {
        id
    }
}`;

export const deletePagesSidebarBlocksItemMutation = gql`
mutation delete_pages_sidebar_blocks_item($id: ID!) {
    delete_pages_sidebar_blocks_item(id: $id) {
        id
    }
}`;

export const updatePagesSidebarBlocksItemMutation = gql`
mutation update_pages_sidebar_blocks_item($id: ID!, $item: update_pages_sidebar_blocks_input!) {
    update_pages_sidebar_blocks_item(id: $id, data: $item) {
        id
    }
}`;

export const pagesPageBlocksQuery = gql`
query pages_page_blocks($pages_id: ID!) {
    pages_page_blocks(filter: { pages_id: { id: { _eq: $pages_id } } }) {
        id
        pages_id {
            id
        }
        collection
        item {
            ... on content_blocks {
                id
            }
            ... on tab_blocks {
                id
            }
            ... on card_blocks {
                id
            }
            ... on expansion_panels {
                id
            }
            ... on collection_blocks {
                id
            }
        }
        sort
    }
}`;

export const pagesSidebarBlocksQuery = gql`
query pages_sidebar_blocks($pages_id: ID!) {
    pages_sidebar_blocks(filter: { pages_id: { id: { _eq: $pages_id } } }) {
        id
        pages_id {
            id
        }
        collection
        item {
            ... on content_blocks {
                id
            }
            ... on collection_blocks {
                id
            }
        }
        sort
    }
}`;

export const updatePagesItemMutation = gql`
mutation update_pages_item($id: ID!, $item: update_pages_input!) {
    update_pages_item(id: $id, data: $item) {
        id
        date_updated
    }
}`;
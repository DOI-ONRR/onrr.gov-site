import { gql } from 'graphql-request';

export const getTabBlocksTabBlocks = gql`
fragment CardBlockFields on card_blocks {
    id
    collection: __typename
    status
    block_label
    block_v_col
    block_color
    block_icon
    block_content
}

fragment ContentBlockFields on content_blocks {
    id
    collection: __typename
    status
    block_label
    block_v_col
    equal_col_height
    block_content
}

fragment ExpansionPanelBlockFields on expansion_panels {
    id
    collection: __typename
    status
    block_label
    block_v_col
    expansion_panel_blocks {
        item {
            ...CardBlockFields
            ...ContentBlockFields
            ...ExpansionPanelBlockLabelFields
        }
    }
}

fragment TabBlockLabelFields on tab_block_label {
    id
    collection: __typename
    tab_block_label
}

fragment ExpansionPanelBlockLabelFields on expansion_panel_block_label {
    id
    collection: __typename
    block_label
}

fragment TabBlockNestedFields on tab_blocks {
    id
    collection: __typename
    status
    tab_block_label
    block_v_col
    tab_blocks {
        item {
            ...CardBlockFields
            ...ContentBlockFields
            ...ExpansionPanelBlockFields
            ...TabBlockLabelFields
        }
    }
}

fragment TabBlockFields on tab_blocks {
    id
    collection: __typename
    status
    tab_block_label
    block_v_col
    tab_blocks {
        item {
            ...CardBlockFields
            ...ContentBlockFields
            ...ExpansionPanelBlockFields
            ...TabBlockLabelFields
            ...TabBlockNestedFields
        }
    }
}

query TabBlocksTabBlocks($tabBlocksId: GraphQLStringOrFloat!) {
    tab_blocks_tab_blocks (
        filter: { 
            tab_blocks_id: { 
                id: { 
                    _eq: $tabBlocksId
                } 
            } 
        }
        sort: ["Sort"]
    ) {
        id
        Sort
        item {
            ...CardBlockFields
            ...ContentBlockFields
            ...TabBlockLabelFields
            ...ExpansionPanelBlockFields
            ...TabBlockFields
        }
    }
}
`;

export const getTopLevelTabBlocks = gql`
query tab_blocks_tab_blocks($tabBlocksId: GraphQLStringOrFloat!) {
    tab_blocks_tab_blocks(
        filter: { tab_blocks_id: { id: { _eq: $tabBlocksId } } }
        sort: ["Sort"]
    ) {
        id
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
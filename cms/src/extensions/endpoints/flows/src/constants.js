export const Endpoints = {
    LOCAL: `${process.env.DIRECTUS_PUBLIC_HOST}/graphql`,
    UPSTREAM: `${process.env.UPSTREAM_URL}/graphql`
}

export const UpstreamAuthToken = process.env.DIRECTUS_EXTENSION_FLOWS_UPSTREAM_AUTH_TOKEN;

export const LocalAuthToken = process.env.DIRECTUS_EXTENSION_FLOWS_LOCAL_AUTH_TOKEN;

export const ApiMessages = {
    ITEM_CREATED: 'item_created',
    ITEM_UPDATED: 'item_updated',
    ITEM_DELETED: 'item_deleted'
}

export const CollectionTypes = {
    CARD_BLOCKS: 'card_blocks',
    CONTENT_BLOCKS: 'content_blocks',
    TAB_BLOCKS: 'tab_blocks',
    TAB_BLOCK_LABEL: 'tab_block_label',
    TAB_BLOCKS_TAB_BLOCKS: 'tab_blocks_tab_blocks',
    EXPANSION_PANELS: 'expansion_panels',
    EXPANSION_PANEL_BLOCK_LABEL: 'expansion_panel_block_label',
    EXPANSION_PANELS_EXPANSION_PANEL_BLOCKS: 'expansion_panels_expansion_panel_blocks',
    PAGES: 'pages',
    PAGES_PAGE_BLOCKS: 'pages_page_blocks'
}

export const PathArrayTypes = {
    TAB_BLOCKS: 'tab_blocks'
}
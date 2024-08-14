export const Endpoints = {
    LOCAL: process.env.DIRECTUS_EXTENSION_FLOWS_LOCAL_ENDPOINT,
    UPSTREAM: process.env.DIRECTUS_EXTENSION_FLOWS_UPSTREAM_ENDPOINT
}

export const AuthToken = process.env.DIRECTUS_EXTENSION_FLOWS_AUTH_TOKEN;

export const ApiMessages = {
    NO_CHANGES: 'no_changes',
    ITEM_CREATED: 'item_created',
    ITEM_UPDATED: 'item_updated',
    ITEM_DELETED: 'item_deleted'
}

export const CollectionTypes = {
    CARD_BLOCKS: 'card_blocks',
    CONTENT_BLOCKS: 'content_blocks',
    TAB_BLOCKS: 'tab_blocks',
    TAB_BLOCK_LABEL: 'tab_block_label',
    EXPANSION_PANELS: 'expansion_panels',
    EXPANSION_PANEL_BLOCK_LABEL: 'expansion_panel_block_label'
}
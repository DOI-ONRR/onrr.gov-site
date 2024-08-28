import { ApiMessages } from "../../src/constants";

export const tabBlockId = 146;

export const tabBlocksTabBlocksCardBlock = [
    {
        "id": "2026",
        "Sort": 1,
        "item": {
            "id": "394",
            "collection": "card_blocks"
        }
    }
];

export const tabBlocksTabBlocksContentBlock = [
    {
        "id": "2027",
        "Sort": 1,
        "item": {
            "id": "394",
            "collection": "content_blocks"
        }
    }
];

export const tabBlocksTabBlocksExpansionPanel = [
    {
        "id": "2028",
        "Sort": 1,
        "item": {
            "id": "394",
            "collection": "expansion_panels"
        }
    }
];

export const tabBlocksTabBlocksTabBlock = [
    {
        "id": "2029",
        "Sort": 1,
        "item": {
            "id": "394",
            "collection": "tab_blocks"
        }
    }
];

export const tabBlocksTabBlocksTabLabel = [
    {
        "id": "2030",
        "Sort": 1,
        "item": {
            "id": "394",
            "collection": "tab_block_label"
        }
    }
]

export const tabBlocksTabBlocksLatest = [
    {
        "id": "2026",
        "Sort": 1,
        "item": {
            "id": "394",
            "collection": "tab_block_label"
        }
    },
    {
        "id": "2027",
        "Sort": 2,
        "item": {
            "id": "73",
            "collection": "expansion_panels"
        }
    },
    {
        "id": "2028",
        "Sort": 3,
        "item": {
            "id": "395",
            "collection": "tab_block_label"
        }
    },
    {
        "id": "2029",
        "Sort": 4,
        "item": {
            "id": "1346",
            "collection": "content_blocks"
        }
    }
];

export const tabBlocksTabBlocksPrevious = [
    {
        "id": "2026",
        "Sort": 1,
        "item": {
            "id": "394",
            "collection": "tab_block_label"
        }
    },
    {
        "id": "2027",
        "Sort": 2,
        "item": {
            "id": "73",
            "collection": "expansion_panels"
        }
    },
];

export function runFlowItemNoChangesMock(item) {
    return {
        id: item.id,
        collection: item.collection,
        message: ApiMessages.NO_CHANGES
    }
};
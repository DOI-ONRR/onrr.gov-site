import { ApiMessages } from "../../src/constants";

export const tabBlocksByIdMock = {
    "id": "146",
    "status": "published",
    "tab_block_label": "Shoob Sub Woofer",
    "block_v_col": "12"
}

export const tabBlocksTabBlocksMock = [
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

export function runFlowItemCreatedMock(item) {
    return {
        id: item.id,
        collection: item.collection,
        message: ApiMessages.ITEM_CREATED
    }
};
import { getTabBlocksById } from '../operations/tabBlocks';
import { Endpoints, AuthToken } from "../constants";
import { diff } from "deep-diff";
import { logger } from "./logger";

export async function run(id) {
    try {
        const latest = await getTabBlocksById(id, Endpoints.LOCAL);
        const previous = await getTabBlocksById(id, Endpoints.UPSTREAM);
        const changes = diff(previous, latest);
        logger.info(`tabBlocksFlowUtil.run:\n ${JSON.stringify(changes, null, 2)}`);
    }
    catch {
        logger.error(`Error in tabBlocksFlowUtil.run (${id}):`, error)
        throw new Error('Error in tabBlocksFlowUtil.run');
    }
}
import { getTabBlocksTabBlocks, getTopLevelTabBlocks } from "../queries/tabBlocksTabBlocks";
import { GraphQLClient } from "graphql-request";
import { logger } from '../utils/logger';
import fetch from 'node-fetch';

const endpoint = "https://preview-onrr-cms.app.cloud.gov/graphql";
const token = "byzWBRBaug2Pb53rRSslRv9EZCRz7HTw";

const client = new GraphQLClient(endpoint, {
    headers: {
        authorization: `Bearer ${token}`,
    },
});

export async function getTabBlocksTabBlocksData(tabBlocksId) {
    try {
        const variables = {
            tabBlocksId: tabBlocksId,
        };
        const data = await client.request(getTabBlocksTabBlocks, variables);
        return data;
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

export async function getTopLevelTabBlocksData(tabBlocksId) {
  try {
      const variables = {
          tabBlocksId: tabBlocksId,
      };
      const data = await client.request(getTopLevelTabBlocks, variables);
      return data;
  } catch (error) {
      console.error("Error fetching data:", error);
  }
}

export async function localFetch(tabBlocksId) {
  const variables = {
    tabBlocksId: tabBlocksId,
  };
  const client = new GraphQLClient('http://127.0.0.1:8055/graphql');
  const data = await client.request(getTopLevelTabBlocks, variables);

  logger.info(`localFetch response: \n ${JSON.stringify(data, null, 2)}`);
}
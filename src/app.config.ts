import { resolve } from 'path';
import * as dotenv from 'dotenv';
dotenv.config();
dotenv.config({ path: `.env.${process.env.APP_ENV || 'dev'}`, override: true });

const {
  HOST = '127.0.0.1',
  PORT = 3002,
  APP_ENV,
  SLACK_WEBHOOK_URL,
  SLACK_LOGGING,
  LOGSTASH_PORT,
  LOGSTASH_HOST,
  LOGSTASH_INDEX,
  BASE_URL = './blockchainCache/',
} = process.env;

const config = {
  HOST,
  PORT,
  APP_ENV,
  DEFI_PROVIDERS_SERVICE_PACKAGE: 'dappradar.defi.providers',
  DEFI_PROVIDERS_SERVICE_PROTOFILE: resolve(
    __dirname,
    '..',
    'proto',
    'defi-providers.proto',
  ),
  LOGSTASH_HOST,
  LOGSTASH_PORT,
  LOGSTASH_INDEX,
  SLACK_WEBHOOK_URL,
  SLACK_LOGGING,
  BASE_URL,
};

const nodeUrls: { [key: string]: string } = {};

nodeUrls['OPTIMISM_NODE_URL'] = process.env['OPTIMISM_NODE_URL'];
nodeUrls['ETHEREUM_NODE_URL'] = process.env['ETHEREUM_NODE_URL'];
nodeUrls['BSC_NODE_URL'] = process.env['BSC_NODE_URL'];
nodeUrls['AURORA_NODE_URL'] = process.env['AURORA_NODE_URL'];
nodeUrls['AVALANCHE_NODE_URL'] = process.env['AVALANCHE_NODE_URL'];
nodeUrls['CELO_NODE_URL'] = process.env['CELO_NODE_URL'];
nodeUrls['EVERSCALE_NODE_URL'] = process.env['EVERSCALE_NODE_URL'];
nodeUrls['FANTOM_NODE_URL'] = process.env['FANTOM_NODE_URL'];
nodeUrls['HEDERA_NODE_URL'] = process.env['HEDERA_NODE_URL'];
nodeUrls['MOONBEAM_NODE_URL'] = process.env['MOONBEAM_NODE_URL'];
nodeUrls['MOONRIVER_NODE_URL'] = process.env['MOONRIVER_NODE_URL'];
nodeUrls['NEAR_NODE_URL'] = process.env['NEAR_NODE_URL'];
nodeUrls['POLYGON_NODE_URL'] = process.env['POLYGON_NODE_URL'];
nodeUrls['RONIN_NODE_URL'] = process.env['RONIN_NODE_URL'];
nodeUrls['SOLANA_NODE_URL'] = process.env['SOLANA_NODE_URL'];
nodeUrls['STACKS_NODE_URL'] = process.env['STACKS_NODE_URL'];
nodeUrls['TEZOS_NODE_URL'] = process.env['TEZOS_NODE_URL'];
nodeUrls['CRONOS_NODE_URL'] = process.env['CRONOS_NODE_URL'];
nodeUrls['ARBITRUM_NODE_URL'] = process.env['ARBITRUM_NODE_URL'];
nodeUrls['ZKSYNC-ERA_NODE_URL'] = process.env['ZKSYNC-ERA_NODE_URL'];

export { config, nodeUrls };

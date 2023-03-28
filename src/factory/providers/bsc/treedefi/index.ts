import basicUtil from '../../../../util/basicUtil';
import FACTORY_ABI from './abi.json';
import util from '../../../../util/blockchainUtil';
import formatter from '../../../../util/formatter';
import { ITvlParams, ITvlReturn } from '../../../../interfaces/ITvl';

const FACTORY_ADDRESS = '0xa9a438b8b2e41b3bf322dba139af9490dc226953';
let pools = [];

async function tvl(params: ITvlParams): Promise<Partial<ITvlReturn>> {
  const { block, chain, provider, web3 } = params;
  if (block < 6052054) {
    return {};
  }

  const contract = new web3.eth.Contract(FACTORY_ABI, FACTORY_ADDRESS);

  try {
    pools = basicUtil.readDataFromFile('cache/pools.json', chain, provider);
  } catch {}

  let poolLength = 0;
  try {
    poolLength = await contract.methods.poolLength().call(null, block);
  } catch {}

  for (let i = pools.length; i < poolLength; i += 1) {
    try {
      const pool = await contract.methods.poolInfo(i).call(null, block);
      pools.push(pool.lpToken.toLowerCase());
    } catch {
      break;
    }
  }

  basicUtil.writeDataToFile(pools, 'cache/pools.json', chain, provider);

  const tokenBalances = {};

  poolLength = pools.length;
  for (let first = 0; first < poolLength; first += 100) {
    const last = Math.min(poolLength, first + 100);
    const balanceResults = await util.getTokenBalances(
      FACTORY_ADDRESS,
      pools.slice(first, last),
      block,
      chain,
      web3,
    );

    formatter.sumMultiBalanceOf(tokenBalances, balanceResults, chain, provider);
  }

  const balances = await util.convertToUnderlyings(
    tokenBalances,
    block,
    chain,
    provider,
    web3,
  );

  return { balances };
}

export { tvl };

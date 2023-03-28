import basicUtil from '../../../../util/basicUtil';
import BigNumber from 'bignumber.js';
import ABI from './abi.json';
import util from '../../../../util/blockchainUtil';
import formatter from '../../../../util/formatter';
import { ITvlParams, ITvlReturn } from '../../../../interfaces/ITvl';

// cache some data
let ctokens = {};
const COMPTROLLER_ADDRESS = '0x589de0f0ccf905477646599bb3e5c622c84cc0ba';
const WBNB_ADDRESS = '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c';

async function getMarkets(block, chain, web3) {
  try {
    const contract = new web3.eth.Contract(ABI, COMPTROLLER_ADDRESS);
    const allCTokens = await contract.methods.getAllMarkets().call(null, block);
    const newCTokens = allCTokens.filter(
      (ctoken) => !ctokens[ctoken.toLowerCase()],
    );
    const underlyings = await util.executeCallOfMultiTargets(
      newCTokens,
      ABI,
      'underlying',
      [],
      block,
      chain,
      web3,
    );
    underlyings.forEach((underlying, index) => {
      ctokens[newCTokens[index].toLowerCase()] = (
        underlying || WBNB_ADDRESS
      ).toLowerCase();
    });
  } catch {}
}

async function tvl(params: ITvlParams): Promise<Partial<ITvlReturn>> {
  const { block, chain, provider, web3 } = params;
  if (block < 100320) {
    return {};
  }

  try {
    ctokens = basicUtil.readDataFromFile('cache/pools.json', chain, provider);
  } catch {}

  await getMarkets(block, chain, web3);

  basicUtil.writeDataToFile(ctokens, 'cache/pools.json', chain, provider);

  const ctokenList = Object.keys(ctokens);
  // Get V1 tokens locked
  const results = await util.executeCallOfMultiTargets(
    ctokenList,
    ABI,
    'getCash',
    [],
    block,
    chain,
    web3,
  );

  const balanceResults = [];
  results.forEach((result, index) => {
    if (result) {
      balanceResults.push({
        token: ctokens[ctokenList[index]],
        balance: BigNumber(result),
      });
    }
  });

  const tokenBalances = {};

  formatter.sumMultiBalanceOf(tokenBalances, balanceResults, chain, provider);

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

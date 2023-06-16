import { ITvlParams, ITvlReturn } from '../../../../interfaces/ITvl';
import basicUtil from '../../../../util/basicUtil';
import util from '../../../../util/blockchainUtil';
import formatter from '../../../../util/formatter';

async function tvl(params: ITvlParams): Promise<Partial<ITvlReturn>> {
  const { block, chain, provider, web3 } = params;
  if (block < 14193653) {
    return {};
  }
  const balances = {};

  console.time('Getting TVL');

  // get contracts relevant for TVL filtered by chain ID
  const contracts = (
    await basicUtil.readFromCache('contracts.json', chain, provider)
  ).find((obj) => {
    return obj.chain === chain.toUpperCase();
  });

  // get TVL in vault contracts
  let tokenBalances;

  for (const vault of contracts.vaults) {
    tokenBalances = await util.getTokenBalances(
      vault.vault,
      vault.tokens,
      block,
      chain,
      web3,
    );
    formatter.sumMultiBalanceOf(balances, tokenBalances, chain, provider);
  }

  // get issued tokens TVL
  const totalSupplies = await util.getTokenTotalSupplies(
    contracts.issuedTokens,
    block,
    chain,
    web3,
  );
  totalSupplies.forEach((result) => {
    if (result && result.totalSupply.isGreaterThan(0)) {
      balances[result.token] = result.totalSupply;
    }
  });

  formatter.convertBalancesToFixed(balances);

  console.timeEnd('Getting TVL');
  return { balances };
}

export { tvl };

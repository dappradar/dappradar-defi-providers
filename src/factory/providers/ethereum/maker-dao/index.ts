import BigNumber from 'bignumber.js';
import ERC20_ABI from '../../../../constants/abi/erc20.json';
import MakerSCDConstants from './makerdao.json';
import MakerMCDConstants from './maker-mcd.json';
import formatter from '../../../../util/formatter';
import util from '../../../../util/blockchainUtil';
import basicUtil from '../../../../util/basicUtil';
import { ITvlParams, ITvlReturn } from '../../../../interfaces/ITvl';

async function getJoins(block, chain, provider, web3) {
  const relyTopic =
    '0x65fae35e00000000000000000000000000000000000000000000000000000000';

  // get list of auths
  let offset = 10000;
  let stored_log;
  try {
    stored_log = await basicUtil.readFromCache(
      'makerdao_log.json',
      chain,
      provider,
    );
  } catch {}

  let i = Math.max(
    MakerMCDConstants.STARTBLOCK,
    Number(stored_log?.block) || 0,
  );
  const logs = stored_log?.data || [];

  for (;;) {
    if (i > block) {
      break;
    }
    try {
      const seperatedLogs = await web3.eth.getPastLogs({
        fromBlock: i,
        toBlock: Math.min(i + offset, block),
        topics: [relyTopic],
        address: MakerMCDConstants.VAT,
      });
      const tokens = seperatedLogs.map(
        (log) => `0x${log.topics[1].substr(26)}`,
      );
      tokens.forEach((token) => {
        if (!logs.includes(token)) {
          logs.push(token);
        }
      });
      i += offset;
      if (offset < 20) {
        offset += 2;
      } else if (offset < 200) {
        offset += 20;
      } else if (offset < 2000) {
        offset += 200;
      } else {
        offset += 2000;
      }
    } catch (e) {
      if (offset > 2000) {
        offset -= 2000;
      } else if (offset > 200) {
        offset -= 200;
      } else if (offset > 20) {
        offset -= 20;
      } else if (offset > 2) {
        offset -= 2;
      } else {
        break;
      }
    }
  }

  const log_data = {
    block: undefined,
    data: undefined,
  };
  log_data.block = Math.max(Number(stored_log.block) || 0, block);
  log_data.data = [];

  const ilkResults = await util.executeCallOfMultiTargets(
    logs,
    MakerMCDConstants.abi,
    'ilk',
    [],
    block,
    chain,
    web3,
  );
  ilkResults.forEach((result, index) => {
    if (result) {
      log_data.data.push(logs[index]);
    }
  });

  await basicUtil.saveIntoCache(log_data, 'makerdao_log.json', chain, provider);
  return log_data.data;
}

async function tvl(params: ITvlParams): Promise<Partial<ITvlReturn>> {
  const { block, chain, provider, web3 } = params;
  const balances = {};

  const scdContract = new web3.eth.Contract(
    ERC20_ABI,
    MakerSCDConstants.WETH_ADDRESS,
  );
  balances[MakerSCDConstants.WETH_ADDRESS] = new BigNumber(
    await scdContract.methods
      .balanceOf(MakerSCDConstants.TUB_ADDRESS)
      .call(null, block),
  );

  if (block >= MakerMCDConstants.STARTBLOCK) {
    let joins = await getJoins(block, chain, provider, web3);

    let gemResults = await util.executeCallOfMultiTargets(
      joins,
      MakerMCDConstants.abi,
      'gem',
      [],
      block,
      chain,
      web3,
    );

    joins = joins.filter((_, index) => gemResults[index]);
    gemResults = gemResults.filter((_, index) => gemResults[index]);
    const balanceResults = await util.getTokenBalancesOfHolders(
      joins,
      gemResults,
      block,
      chain,
      web3,
    );

    formatter.sumMultiBalanceOf(balances, balanceResults);
  }

  formatter.convertBalancesToFixed(balances);
  return { balances };
}

export { tvl };

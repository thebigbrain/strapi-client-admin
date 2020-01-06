import {parallel, pipe} from 'overmind';
import * as o from './operators';
import {withLoadApp} from '../../operators';

const PAPER_STATE = {
  ISSUED: 'issued',
  TRADING: 'trading',
  REDEEMED: 'redeemed'
};

const CONTRACT_STATE = {
  NONE: 'none',
  TRADING: 'trading'
};

const ImmediatelyContracts = new Set([0, 1]);

export const isOwned = ({state}, id) => {
  return state.userContracts.has(id);
};

export const done = parallel(
  o.transferContract(),
  o.addToUser(),
);

export const buy = ({state, actions}, contract) => {
  if (contract.state === CONTRACT_STATE.TRADING) {
    console.warn(`该合约(${contract.id})正在交易中...`);
    return;
  }

  if (actions.contract.isOwned(contract.id)) {
    console.warn(`已持有该合约(${contract.id})`);
  } else {
    if (ImmediatelyContracts.has(contract.id)) {
      actions.contract.done(contract, state.user.current);
    } else {
      contract.state = CONTRACT_STATE.TRADING;
    }

    actions.order.addOrders({
      contract: contract.id,
      toOwner: state.user.current
    });
  }
};

export const sell = ({actions}, contract, newOwner) => {
  actions.contract.done(contract, newOwner);
};

export const reject = ({actions}, contract) => {
  actions.contract.done(contract, null);
};

export const loadContracts = withLoadApp(async ({state, effects}) => {
  let s = effects.api.getService('contracts');
  let r = await s.find();
  if (r.total > 0) state.contract.contracts = r.data;
});

export const addContract = pipe(
  o.createContract()
);

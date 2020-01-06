import {mutate, run} from 'overmind';

export const transferContract = () => {
  return run(async ({effects}, contract, newOwner = null) => {
    let s = effects.api.getService('contracts');
    let patch = {};
    if (newOwner) patch.owner = newOwner;
    await s.patch(contract._id, patch);
  });
};

export const addToUser = () => {
  return mutate(async ({state, effects}, id) => {
    let s = effects.api.getService('users');
    let contracts = Array.from(state.userContracts);
    contracts.push(id);
    await s.patch(state.user._id, {contracts});
    state.userContracts.add(id);
  });
};

export const createContract = () => {
  return run(async ({effects}, data) => {
    let s = effects.api.getService('transactions');
    await s.create({
      ledger: '',
      channel: '',
      data
    });
  });
};

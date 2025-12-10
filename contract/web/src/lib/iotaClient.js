// Stubbed client for future on-chain integration.
// Replace the placeholders when you have RPC + wallet signer wired up.
import { appConfig } from '../config';

export const hatchOnChain = async ({ packageId, hatchGameId, randomObjectId, signer }) => {
  if (!signer) throw new Error('Missing signer/wallet');
  if (!packageId || !hatchGameId) throw new Error('Missing package or game id');

  // TODO: Wire with @iota/iota-sdk once wallet + RPC are configured.
  // Example shape to implement later:
  // const tx = new Transaction();
  // tx.moveCall({
  //   target: `${packageId}::lucky_egg::hatch`,
  //   arguments: [hatchGameId, randomObjectId],
  // });
  // const result = await signer.signAndExecuteTransaction(tx);
  // return result;

  console.warn('hatchOnChain is a stub. Configure RPC + signer to enable.');
  return { digest: '0xstub', rarity: 'Common', tokenId: 'egg_stub' };
};

export const createGameOnChain = async ({ packageId, dailyLimit, commonUri, rareUri, epicUri, signer }) => {
  if (!signer) throw new Error('Missing signer/wallet');
  if (!packageId) throw new Error('Missing package id');
  console.warn('createGameOnChain is a stub. Configure RPC + signer to enable.');
  return { digest: '0xstub_create', hatchGameId: '0xstub_game' };
};

export const hatchTenOnChain = async ({ packageId, hatchGameId, randomObjectId, signer }) => {
  if (!signer) throw new Error('Missing signer/wallet');
  if (!packageId || !hatchGameId) throw new Error('Missing package or game id');
  console.warn('hatchTenOnChain is a stub. Configure RPC + signer to enable.');
  return { digest: '0xstub_batch' };
};

export const applyPresetConfig = () => ({
  packageId: appConfig.packageId,
  hatchGameId: appConfig.hatchGameId,
  rpcUrl: appConfig.rpcUrl,
  randomObjectId: appConfig.randomObjectId,
});

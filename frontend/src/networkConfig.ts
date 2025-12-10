import { getFullnodeUrl } from "@iota/iota-sdk/client";
import { createNetworkConfig } from "@iota/dapp-kit";

const { networkConfig, useNetworkVariable, useNetworkVariables } =
  createNetworkConfig({
    devnet: {
      url: getFullnodeUrl("devnet"),
      variables : {
        packageId:"0xdaaafb8a2efc94699a93c943a1d73d1b812f4b3a217ddb30c99f84c11ecf80ce",
        creatorObjectId:"0x1b196fc2c83a3d13422190748f9bfeb45b0a40719dd0c9d745048e4bf09693e1",
        totalTicketObjectId:"0x6e20369237c2a0d2bc33315b25cf0105b0561028fea57b35a123fdf71ddd175d",
        categoryObjectId:"0x7e744a352ef38722369f146fe9e4e697d813d561852e4780da367887bc01dc9c",
        soldTicketObjectId:"0x496ea8aaf2e3d52e30bbb69475841036e3dac80fa881c973c5c23ee991483ecb",
      }
    },
    testnet: {
      url: getFullnodeUrl("testnet"),
    },
    mainnet: {
      url: getFullnodeUrl("mainnet"),
    },
  });

export { useNetworkVariable, useNetworkVariables, networkConfig };

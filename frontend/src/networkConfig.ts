import { getFullnodeUrl } from "@iota/iota-sdk/client";
import { createNetworkConfig } from "@iota/dapp-kit";

const { networkConfig, useNetworkVariable, useNetworkVariables } =
  createNetworkConfig({
    devnet: {
      url: getFullnodeUrl("devnet"),
      variables: {
        packageId: "0xb38ba79987a371c18a558190ce41b2a51ff9cf637516cef304b44d3e19c7598c",
        
        gameObjectId: "0xe52da5cd2aa07cee61217878d26361cbf32b48c0fe902b9ac78603d673b51207",
        
        randomObjectId: "0x8" 
      }
    },
    testnet: {
      url: getFullnodeUrl("testnet"),
      variables: {
        packageId: "0xb38ba79987a371c18a558190ce41b2a51ff9cf637516cef304b44d3e19c7598c",
        gameObjectId: "0xe52da5cd2aa07cee61217878d26361cbf32b48c0fe902b9ac78603d673b51207",
        randomObjectId: "0x8"
      }
    },
    mainnet: {
      url: getFullnodeUrl("mainnet"),
      variables: {
        packageId: "0xb38ba79987a371c18a558190ce41b2a51ff9cf637516cef304b44d3e19c7598c",
        gameObjectId: "0xe52da5cd2aa07cee61217878d26361cbf32b48c0fe902b9ac78603d673b51207",
        randomObjectId: "0x8"
      }
    },
  });

export { useNetworkVariable, useNetworkVariables, networkConfig };
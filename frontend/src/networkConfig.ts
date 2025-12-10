import { getFullnodeUrl } from "@iota/iota-sdk/client";
import { createNetworkConfig } from "@iota/dapp-kit";

const { networkConfig, useNetworkVariable, useNetworkVariables } =
  createNetworkConfig({
    devnet: {
      url: getFullnodeUrl("devnet"),
      variables: {
        packageId: "YOUR_NEW_PACKAGE_ID_HERE",
        
        gameObjectId: "YOUR_HATCH_GAME_OBJECT_ID_HERE",
        
        randomObjectId: "0x8" 
      }
    },
    testnet: {
      url: getFullnodeUrl("testnet"),
      variables: {
        packageId: "YOUR_NEW_PACKAGE_ID_HERE",
        gameObjectId: "YOUR_HATCH_GAME_OBJECT_ID_HERE",
        randomObjectId: "0x8"
      }
    },
    mainnet: {
      url: getFullnodeUrl("mainnet"),
      variables: {
        packageId: "",
        gameObjectId: "",
        randomObjectId: "0x8"
      }
    },
  });

export { useNetworkVariable, useNetworkVariables, networkConfig };
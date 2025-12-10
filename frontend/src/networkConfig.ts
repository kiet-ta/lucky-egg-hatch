import { getFullnodeUrl } from "@iota/iota-sdk/client";
import { createNetworkConfig } from "@iota/dapp-kit";

const { networkConfig, useNetworkVariable, useNetworkVariables } =
  createNetworkConfig({
    devnet: {
      url: getFullnodeUrl("devnet"),
      variables: {
        packageId: "0x41065a368e8e49886ed7c2d9e4638989bf4c3c1eabd02126a5dfcf59bfc95dfb",
        
        gameObjectId: "0xfdb2a6acb4966ac718cfb17e07928a17b0ee50b38ebcef5d60b3354081096224",
        
        randomObjectId: "0x8" 
      }
    },
    testnet: {
      url: getFullnodeUrl("testnet"),
      variables: {
        packageId: "0x41065a368e8e49886ed7c2d9e4638989bf4c3c1eabd02126a5dfcf59bfc95dfb",
        gameObjectId: "0xfdb2a6acb4966ac718cfb17e07928a17b0ee50b38ebcef5d60b3354081096224",
        randomObjectId: "0x8"
      }
    },
    mainnet: {
      url: getFullnodeUrl("mainnet"),
      variables: {
        packageId: "0x41065a368e8e49886ed7c2d9e4638989bf4c3c1eabd02126a5dfcf59bfc95dfb",
        gameObjectId: "0xfdb2a6acb4966ac718cfb17e07928a17b0ee50b38ebcef5d60b3354081096224",
        randomObjectId: "0x8"
      }
    },
  });

export { useNetworkVariable, useNetworkVariables, networkConfig };
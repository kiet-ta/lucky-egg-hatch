# Lucky Egg Hatch 🥚

## 📍 Contract Information

After deployment, update your contract details here for easy reference:

**Network**: Testnet / Devnet
**Package ID**: `0x...` (Result from deployment)
**Game Object ID**: `0x...` (Result from initialization)
**Explorer**: [View on IOTA Explorer](https://explorer.iota.org/)

## 🚀 Getting Started

1. **Install dependencies:**
   Start at the root directory of the project.
   ```bash
   npm install

2.  **Deploy & Initialize the Game:**

    ```bash
    # Deploy the smart contract to the network
    npm run iota-deploy

    # Create the Game Object and set up metadata
    npm run iota-init
    ```

3.  **Start the Frontend:**

    ```bash
    cd frontend
    npm install
    npm run dev
    ```

4.  **Open [http://localhost:5173](https://www.google.com/search?q=http://localhost:5173)** in your browser.

## 📝 Detailed Steps

### 1\. Deploy Your Move Contract

**Automated Deployment (Recommended)**

```bash
npm run iota-deploy
```

This script (`scripts/iota-deploy-wrapper.js`) will:

  - ✅ Verify IOTA CLI installation.
  - ✅ Build the Move contract located in `contract/lucky_egg`.
  - ✅ Publish the package to the active network.
  - ✅ **Log the Package ID** (Save this, you will need it for the frontend).

**Manual Deployment**

If you prefer manual control:

```bash
cd contract/lucky_egg
iota move build
iota client publish --gas-budget 100000000
```

### 2\. Initialize Game State

Unlike simple contracts, this game requires a **Shared Object** to store player states and inventory. You must run this once after deployment.

```bash
npm run iota-init
```

This script (`scripts/init-game.js`) will:

  - ✅ Call the `create_game` entry function.
  - ✅ Configure metadata URIs for all rarity tiers (Common, Rare, Epic, Legendary).
  - ✅ Share the `HatchGame` object on-chain.
  - ✅ **Log the Game Object ID**.

### 3\. Connect the Frontend

Once deployed and initialized, you need to tell the frontend where to find your contract.

1.  Open `frontend/src/networkConfig.ts` (or your equivalent config file).
2.  Update the `packageId` with the ID from Step 1.
3.  Update the `gameObjectId` with the ID from Step 2.

## 📁 Project Structure

```
├── contract/             # Move smart contracts
│   └── lucky_egg/        # Main game module
│       ├── sources/      # Move source code
│       └── Move.toml     # Contract manifest
├── frontend/             # React/Vite application
│   ├── src/
│   │   ├── components/   # UI Components (HatchButton, Inventory, etc.)
│   │   ├── hooks/        # Custom React hooks
│   │   └── style.ts      # Styling configurations
│   └── vite.config.ts    # Vite configuration
├── scripts/              # Automation scripts
│   ├── iota-deploy-wrapper.js
│   └── init-game.js
└── package.json          # Root scripts
```

## 🔧 Advanced Configuration

### Adjusting Game Logic (Drop Rates & Pity)

To change the game mechanics, edit `contract/lucky_egg/sources/lucky_egg.move`.

**Key Constants:**

  - `BASE_COMMON`, `BASE_RARE`, etc.: Adjust drop probabilities.
  - `SOFT_PITY_START`: When the pity system kicks in.
  - `HARD_PITY`: The guarantee threshold for Legendary items.

*Note: After modifying Move code, you must re-run `npm run iota-deploy` and `npm run iota-init`.*

## 🐛 Troubleshooting

### "Object Not Found" Error

  - Ensure you have run `npm run iota-init`. The game cannot function without the shared `HatchGame` object.
  - specific the correct `gameObjectId` in your frontend configuration.

### Deployment Fails (Insufficient Gas)

  - Check your balance: `iota client gas`.
  - Request tokens from the IOTA Faucet for your active environment (Testnet/Devnet).

### Build Errors

  - Ensure you are using the correct Move version in `Move.toml`.
  - Run `iota move test` in the contract directory to debug logic errors before deploying.

## 📚 Additional Resources

  - [IOTA Documentation](https://wiki.iota.org/)
  - [IOTA dApp Kit](https://github.com/iotaledger/dapp-kit)
  - [Move Language Book](https://move-book.com/)


## 📄 License

MIT

# Lucky Egg Hatch

## Layout
- Contract package: `project/lucky_egg`
- Frontend mock: `project/web` (React + Vite)

## Build & Test (contract)
```bash
iota move build --path project/lucky_egg
iota move test --path project/lucky_egg
```

## Frontend mock (optional)
```bash
cd project/web
npm install
npm run dev   # open http://localhost:5173
```
Mock-only by default. On-chain calls are stubbed; wire signer/RPC in `src/lib/iotaClient.js` if you want to hit the chain.

## Deploy (testnet/localnet)
1) Publish:
```bash
iota client publish --path project/lucky_egg --gas-budget <budget> --serialize-output
```
2) Record `PACKAGE_ID` and the shared `HatchGame` object from publish effects.
3) Init metadata (one-time):
```bash
iota client call \
  --function create_game \
  --module lucky_egg \
  --package <PACKAGE_ID> \
  --args 4 "ipfs://common_hash" "ipfs://rare_hash" "ipfs://epic_hash" "ipfs://legendary_hash" \
  --gas-budget <budget>
```
4) Use:
- x1: `hatch(&mut HatchGame, &Random)` with `HatchGame` ID + `Random` shared object `0x8`.
- x10: `hatch_ten(&mut HatchGame, &Random)` (soft pity starts at 70, hard pity at 90 = guaranteed Legendary; batch guarantees ≥1 Epic).

## Contract behavior (functions)
- `create_game(common_uri, rare_uri, epic_uri, legendary_uri)`: Shares `HatchGame`; seeds metadata URIs; sets default item-name pools (10 per rarity).
- `hatch(...)`: Rolls rarity (base 70/20/8/2, pity soft 70, hard 90), picks a random item name of that rarity, mints `HatchedEgg`, updates on-chain inventory, emits `EggHatchedEvent`.
- `hatch_ten(...)`: Runs 10 hatches with shared RNG; if no Epic/Legendary by the last roll, forces Epic; pity increments per egg; emits per-egg events; updates inventory.

## Data model (on-chain)
- `HatchGame`: metadata URIs; item-name pools; Bag of `player_states`.
- `PlayerState`: pity counter; `PlayerInventory` (Bag item_name → count + rarity totals).
- `HatchedEgg`: NFT with rarity, item_name, metadata_uri (tags owner + item), hatch_number, hatch_epoch.
- `EggHatchedEvent`: emitted for each hatch with player, rarity, egg_id, metadata_uri, hatch_number.

Reading inventory/NFTs off-chain:
- Query owned `HatchedEgg` objects for a wallet (type `package::lucky_egg::HatchedEgg`).
- Inspect `player_states` Bag inside `HatchGame` via RPC/indexer to read inventory/totals (dynamic fields).
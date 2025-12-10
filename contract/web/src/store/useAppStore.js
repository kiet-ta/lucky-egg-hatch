import { create } from 'zustand';

const rollRarity = () => {
  const roll = Math.floor(Math.random() * 100);
  if (roll < 70) return 'Common';
  if (roll < 90) return 'Rare';
  if (roll < 98) return 'Epic';
  return 'Legendary';
};

const pushResult = (set, get, entry) => {
  const { history } = get();
  set({ history: [entry, ...history].slice(0, 30) });
};

const itemPools = {
  Common: ['common_1', 'common_2', 'common_3', 'common_4', 'common_5', 'common_6', 'common_7', 'common_8', 'common_9', 'common_10'],
  Rare: ['rare_1', 'rare_2', 'rare_3', 'rare_4', 'rare_5', 'rare_6', 'rare_7', 'rare_8', 'rare_9', 'rare_10'],
  Epic: ['epic_1', 'epic_2', 'epic_3', 'epic_4', 'epic_5', 'epic_6', 'epic_7', 'epic_8', 'epic_9', 'epic_10'],
  Legendary: ['legendary_1', 'legendary_2', 'legendary_3', 'legendary_4', 'legendary_5', 'legendary_6', 'legendary_7', 'legendary_8', 'legendary_9', 'legendary_10'],
};

const randomItemName = (rarity) => {
  const pool = itemPools[rarity] || [];
  const idx = Math.floor(Math.random() * pool.length);
  return pool[idx] || `${rarity.toLowerCase()}_1`;
};

const updateInventory = (set, get, rarity, itemName) => {
  const { inventory } = get();
  const rarityInv = inventory[rarity] || {};
  const nextCount = (rarityInv[itemName] || 0) + 1;
  const nextRarityInv = { ...rarityInv, [itemName]: nextCount };
  set({ inventory: { ...inventory, [rarity]: nextRarityInv } });
};

export const useAppStore = create((set, get) => ({
  wallet: '',
  packageId: '',
  hatchGameId: '',
  rpcUrl: '',
  randomObjectId: '0x8',
  history: [],
  inventory: { Common: {}, Rare: {}, Epic: {}, Legendary: {} },
  isHatching: false,
  setWallet: (val) => set({ wallet: val }),
  setPackageId: (val) => set({ packageId: val }),
  setHatchGameId: (val) => set({ hatchGameId: val }),
  setRpcUrl: (val) => set({ rpcUrl: val }),
  setRandomObjectId: (val) => set({ randomObjectId: val }),
  hatchMock: () => {
    const { wallet } = get();
    if (!wallet) return;
    const rarity = rollRarity();
    const itemName = randomItemName(rarity);
    const tokenId = `egg_${Date.now()}`;
    const entry = {
      wallet,
      rarity,
      itemName,
      tokenId,
      at: new Date().toISOString(),
      mode: 'mock',
    };
    pushResult(set, get, entry);
    updateInventory(set, get, rarity, itemName);
  },
  hatchMockTen: () => {
    const { wallet } = get();
    if (!wallet) return;
    let hasEpicOrLegendary = false;
    let i = 0;
    while (i < 10) {
      const rarity = rollRarity();
      const itemName = randomItemName(rarity);
      const tokenId = `egg_${Date.now()}_${i}`;
      if (rarity === 'Epic' || rarity === 'Legendary') {
        hasEpicOrLegendary = true;
      }
      const entry = {
        wallet,
        rarity,
        itemName,
        tokenId,
        at: new Date().toISOString(),
        mode: 'mock x10',
      };
      pushResult(set, get, entry);
      updateInventory(set, get, rarity, itemName);
      i += 1;
    }
    if (!hasEpicOrLegendary) {
      const { history } = get();
      if (history.length > 0) {
        const [first, ...rest] = history;
        const forced = { ...first, rarity: 'Epic', itemName: randomItemName('Epic'), mode: 'mock x10 (guaranteed)' };
        set({ history: [forced, ...rest] });
        updateInventory(set, get, 'Epic', forced.itemName);
      }
    }
  },
}));

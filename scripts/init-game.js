const { execSync } = require('child_process');
const fs = require('fs');

// The script will auto-read the Package ID from the frontend config file, no manual copy/paste needed
const FRONTEND_CONFIG = 'frontend/src/networkConfig.ts';

// Default image/metadata URIs for egg types (You can update these later)
const URIS = [
    "ipfs://QmCommonEgg",    // Common
    "ipfs://QmRareEgg",      // Rare
    "ipfs://QmEpicEgg",      // Epic
    "ipfs://QmLegendaryEgg"  // Legendary
];

console.log("\x1b[36m%s\x1b[0m", "🥚 LUCKY EGG INITIALIZER 🥚");

try {
    // 1. Read Package ID from current config file
    if (!fs.existsSync(FRONTEND_CONFIG)) throw new Error("networkConfig.ts not found");
    
    const configContent = fs.readFileSync(FRONTEND_CONFIG, 'utf-8');
    const packageIdMatch = configContent.match(/packageId:\s*"([^"]+)"/);
    
    if (!packageIdMatch) throw new Error("Package ID missing in config. Run deploy first!");
    const packageId = packageIdMatch[1];
    
    console.log(`📦 Found Package ID: \x1b[32m${packageId}\x1b[0m`);

    // 2. Call create_game function
    console.log("🚀 Initializing Game State on-chain...");
    
    // Note: create_game takes 4 parameters as vector<u8> (string bytes)
    const args = URIS.map(u => `"${u}"`).join(' ');
    const cmd = `iota client call --package ${packageId} --module lucky_egg --function create_game --args ${args} --gas-budget 100000000 --json`;
    
    const output = execSync(cmd, { encoding: 'utf-8' });
    const result = JSON.parse(output);

    if (result.effects.status.status !== 'success') throw new Error("Transaction Failed!");

    // 3. Find Game Object ID (it's the object that was 'created' and 'shared')
    const createdObjs = result.objectChanges.filter(o => o.type === 'created');
    // Find the object whose type contains HatchGame
    const gameObj = createdObjs.find(o => o.objectType.includes("::lucky_egg::HatchGame"));

    if (!gameObj) throw new Error("Game Object not found in returned result!");
    
    const gameId = gameObj.objectId;
    console.log(`✅ Game Initialized! Object ID: \x1b[32m${gameId}\x1b[0m`);

    // 4. Update Frontend Config
    const newConfig = configContent.replace(
        /gameObjectId:\s*"[^"]*",/g, // Find old gameObjectId line
        `gameObjectId: "${gameId}",`  // Replace with new ID
    );
    
    fs.writeFileSync(FRONTEND_CONFIG, newConfig);
    console.log(`✨ Updated gameObjectId in ${FRONTEND_CONFIG}`);

} catch (e) {
    console.error("\n🔥 ERROR:", e.message);
    if (e.stdout) console.log(e.stdout.toString());
    if (e.stderr) console.log(e.stderr.toString());
}

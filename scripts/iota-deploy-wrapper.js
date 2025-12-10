const { execSync } = require('child_process');
const fs = require('fs');
const readline = require('readline');

const CONTRACT_PATH = 'contract/lucky_egg';
const TOML_PATH = `${CONTRACT_PATH}/Move.toml`;
const FRONTEND_CONFIG = 'frontend/src/networkConfig.ts';

const SAFE_COMMIT_HASH = "be06f419eaaa16e338875508a8e1b3469d77461c";

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log("\x1b[36m%s\x1b[0m", "🥚 LUCKY EGG DEPLOYER - SENIOR MODE 🥚");

rl.question('Select Network (1: devnet, 2: testnet): ', (answer) => {
    const network = answer.trim() === '2' ? 'testnet' : 'devnet';
    console.log(`\n🚀 Preparing to deploy to: \x1b[33m${network}\x1b[0m`);
    
    deploy(network);
    rl.close();
});

function deploy(network) {
    try {
        console.log(`[1/5] Switching IOTA Client to ${network}...`);
        try {
            execSync(`iota client switch --env ${network}`, { stdio: 'ignore' });
        } catch (e) {
            console.log(`⚠️  Mạng '${network}' chưa có trong CLI. Đang tạo mới...`);
            const url = network === 'devnet' ? 'https://api.devnet.iota.cafe' : 'https://api.testnet.iota.cafe';
            execSync(`iota client new-env --alias ${network} --rpc ${url}`, { stdio: 'ignore' });
            execSync(`iota client switch --env ${network}`, { stdio: 'ignore' });
        }

        console.log(`[2/5] Fixing Move.toml compatibility...`);
        let tomlContent = fs.readFileSync(TOML_PATH, 'utf-8');
        const fixedToml = tomlContent.replace(
            /Iota\s*=\s*{[^}]*}/, 
            `Iota = { git = "https://github.com/iotaledger/iota.git", subdir = "crates/iota-framework/packages/iota-framework", rev = "${SAFE_COMMIT_HASH}" }`
        );
        fs.writeFileSync(TOML_PATH, fixedToml);

        // 3. Clean Build cũ
        console.log(`[3/5] Cleaning old build artifacts...`);
        execSync(`rm -rf ${CONTRACT_PATH}/build ${CONTRACT_PATH}/Move.lock`, { stdio: 'ignore' });

        // 4. Deploy
        console.log(`[4/5] Publishing contract... (Please wait)`);
        const cmd = `iota client publish --gas-budget 1000000000 --json ${CONTRACT_PATH}`;
        const output = execSync(cmd, { encoding: 'utf-8' });
        const result = JSON.parse(output);

        if (result.effects.status.status !== 'success') {
            throw new Error('Transaction Failed on Chain!');
        }

        const publishedObj = result.objectChanges.find(o => o.type === 'published');
        const packageId = publishedObj.packageId;
        console.log(`\n✅ SUCCESS! Package ID: \x1b[32m${packageId}\x1b[0m`);

        console.log(`[5/5] Updating Frontend Config...`);
        updateFrontend(packageId, network);

    } catch (error) {
        console.error('\n🔥 DEPLOY FAILED:', error.message);
        if (error.stderr) console.error(error.stderr.toString());
        if (error.stdout) console.error(error.stdout.toString()); 
    }
}

function updateFrontend(packageId, network) {
    if (!fs.existsSync(FRONTEND_CONFIG)) return;
    
    let config = fs.readFileSync(FRONTEND_CONFIG, 'utf-8');
    
    const newConfig = config.replace(/packageId:\s*"[^"]*",/g, `packageId: "${packageId}",`);
    
    fs.writeFileSync(FRONTEND_CONFIG, newConfig);
    console.log(`✨ Updated ${FRONTEND_CONFIG}`);
}
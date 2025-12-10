import React, { useEffect } from 'react';
import { appConfig } from './config';
import { useAppStore } from './store/useAppStore';
import { applyPresetConfig, hatchOnChain, hatchTenOnChain } from './lib/iotaClient';
import './styles.css';

const Field = ({ label, value, onChange, placeholder }) => (
  <label className="field">
    <span>{label}</span>
    <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
  </label>
);

export default function App() {
  const {
    wallet,
    packageId,
    hatchGameId,
    rpcUrl,
    randomObjectId,
    history,
    inventory,
    isHatching,
    setWallet,
    setPackageId,
    setHatchGameId,
    setRpcUrl,
    setRandomObjectId,
    hatchMock,
    hatchMockTen,
  } = useAppStore();
  const [showInventory, setShowInventory] = React.useState(false);
  const [invFilter, setInvFilter] = React.useState('All');

  useEffect(() => {
    const preset = applyPresetConfig();
    setPackageId(preset.packageId ?? '');
    setHatchGameId(preset.hatchGameId ?? '');
    setRpcUrl(preset.rpcUrl ?? '');
    setRandomObjectId(preset.randomObjectId ?? '0x8');
  }, [setPackageId, setHatchGameId, setRpcUrl, setRandomObjectId]);

  const hatchReal = async () => {
    useAppStore.setState({ isHatching: true });
    try {
      // Wire your wallet signer here, e.g., from a provider.
      await hatchOnChain({
        packageId,
        hatchGameId,
        randomObjectId,
        signer: null, // replace with actual signer
      });
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      useAppStore.setState({ isHatching: false });
    }
  };

  const hatchRealTen = async () => {
    useAppStore.setState({ isHatching: true });
    try {
      await hatchTenOnChain({
        packageId,
        hatchGameId,
        randomObjectId,
        signer: null, // replace with actual signer
      });
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      useAppStore.setState({ isHatching: false });
    }
  };

  return (
    <div className="page">
      <header>
        <div>
          <p className="eyebrow">Lucky Egg Hatch</p>
          <h1>Try the flow locally</h1>
          <p className="sub">Use mock mode now. Swap to on-chain once you have RPC + signer.</p>
        </div>
      </header>

      <section className="panel">
        <h2>Config</h2>
        <div className="grid">
          <Field label="Wallet (mock)" value={wallet} onChange={setWallet} placeholder="0x..." />
          <Field label="Package ID" value={packageId} onChange={setPackageId} placeholder="0x..." />
          <Field label="HatchGame ID" value={hatchGameId} onChange={setHatchGameId} placeholder="0x..." />
          <Field label="Random Object ID" value={randomObjectId} onChange={setRandomObjectId} placeholder="0x8" />
          <Field label="RPC URL" value={rpcUrl} onChange={setRpcUrl} placeholder={appConfig.rpcUrl} />
        </div>
        <div className="actions">
          <button className="primary" onClick={hatchMock}>Hatch (Mock)</button>
          <button className="primary ghost-outline" onClick={hatchMockTen}>Hatch x10 (Mock)</button>
          <button className="ghost" onClick={hatchReal} disabled={isHatching}>Hatch (On-chain stub)</button>
          <button className="ghost" onClick={hatchRealTen} disabled={isHatching}>Hatch x10 (On-chain stub)</button>
          <button className="ghost" onClick={() => setShowInventory(true)}>Inventory</button>
        </div>
      </section>

      <section className="panel">
        <h2>Results</h2>
        {history.length === 0 ? (
          <p className="muted">No hatches yet. Run mock to see a result.</p>
        ) : (
          <div className="list">
            {history.map((item) => (
              <div key={item.tokenId + item.at} className="card">
                <div className={`rarity ${item.rarity.toLowerCase()}`}>{item.rarity}</div>
                <div className="meta">
                  <p className="token">{item.tokenId} {item.itemName ? `• ${item.itemName}` : ''}</p>
                  <p className="muted">{item.wallet} • {item.at} • {item.mode}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {showInventory && (
        <div className="modal-backdrop" onClick={() => setShowInventory(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Inventory</h3>
              <div className="modal-actions">
                <select value={invFilter} onChange={(e) => setInvFilter(e.target.value)}>
                  <option value="All">All</option>
                  <option value="Common">Common</option>
                  <option value="Rare">Rare</option>
                  <option value="Epic">Epic</option>
                  <option value="Legendary">Legendary</option>
                </select>
                <button className="ghost" onClick={() => setShowInventory(false)}>Close</button>
              </div>
            </div>
            <div className="list">
              {['Common', 'Rare', 'Epic', 'Legendary']
                .filter((r) => invFilter === 'All' || invFilter === r)
                .map((rarity) => {
                  const items = inventory[rarity] || {};
                  const entries = Object.entries(items);
                  if (entries.length === 0) return null;
                  return entries.map(([name, count]) => (
                    <div key={`${rarity}-${name}`} className="card">
                      <div className={`rarity ${rarity.toLowerCase()}`}>{rarity}</div>
                      <div className="meta">
                        <p className="token">{name}</p>
                        <p className="muted">Count: {count}</p>
                      </div>
                    </div>
                  ));
                })}
              {invFilter !== 'All' && Object.entries(inventory[invFilter] || {}).length === 0 && (
                <p className="muted">No items for {invFilter}.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

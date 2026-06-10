import { motion, AnimatePresence } from 'framer-motion';
import { playClick, playCoin } from '../engine/sound';

export const SKINS = [
  {
    id: 'default',
    name: 'Default Bot',
    description: 'The classic yellow coding assistant. Reliable and cheerful!',
    cost: 0,
    color: '#e8b94a',
    emoji: '🤖',
  },
  {
    id: 'cyber',
    name: 'Cyber-Glow',
    description: 'Glowing neon grids and visual scanners. Very sci-fi!',
    cost: 30,
    color: '#00f2fe',
    emoji: '🌐',
  },
  {
    id: 'ninja',
    name: 'Crimson Ninja',
    description: 'Sleek red fabric and stealth headband. Fast and silent.',
    cost: 50,
    color: '#e06c75',
    emoji: '🏮',
  },
  {
    id: 'alien',
    name: 'Cosmic Alien',
    description: 'A cute lime-green visitor from space in a purple suit.',
    cost: 75,
    color: '#98c379',
    emoji: '👽',
  },
  {
    id: 'gold',
    name: 'Gilded Creator',
    description: 'Polished golden crown and developer shades. Pure status!',
    cost: 100,
    color: '#ffd700',
    emoji: '👑',
  },
];

export default function SkinShop({
  show,
  onClose,
  coins,
  setCoins,
  unlockedSkins,
  setUnlockedSkins,
  selectedSkin,
  setSelectedSkin,
}) {
  const handleBuyOrEquip = (skin) => {
    if (unlockedSkins.includes(skin.id)) {
      // Equip
      setSelectedSkin(skin.id);
      localStorage.setItem('scriptquest_selected_skin', skin.id);
      playClick();
    } else {
      // Buy
      if (coins >= skin.cost) {
        const newCoins = coins - skin.cost;
        const newUnlocked = [...unlockedSkins, skin.id];
        setCoins(newCoins);
        setUnlockedSkins(newUnlocked);
        setSelectedSkin(skin.id);
        
        localStorage.setItem('scriptquest_coins', newCoins.toString());
        localStorage.setItem('scriptquest_unlocked_skins', JSON.stringify(newUnlocked));
        localStorage.setItem('scriptquest_selected_skin', skin.id);
        
        playCoin();
      } else {
        // Not enough coins
        playClick(); // play standard click
      }
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: 'rgba(5, 5, 10, 0.85)', backdropFilter: 'blur(10px)' }}
        >
          {/* Modal Card */}
          <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            className="glass-panel glow-border rounded-3xl p-6 max-w-2xl w-full relative flex flex-col gap-5 overflow-hidden"
            style={{
              maxHeight: '90vh',
              background: 'rgba(20, 20, 30, 0.9)',
              border: '1.5px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            {/* Background ambient glow inside shop */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between z-10 border-b border-white/5 pb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">👕</span>
                <div>
                  <h2 className="text-lg font-black tracking-tight text-white">Avatar Customization</h2>
                  <p className="text-xs text-white/50">Spend your coding gold to unlock Roblox-style skins!</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* Coins Indicator */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold text-xs shadow-[0_0_8px_rgba(245,158,11,0.1)]">
                  <span>🪙</span>
                  <span>{coins} Coins</span>
                </div>
                
                {/* Close Button */}
                <button
                  onClick={() => { playClick(); onClose(); }}
                  className="w-8 h-8 rounded-lg flex items-center justify-center border border-white/10 hover:bg-white/5 text-white/70 hover:text-white transition-all cursor-pointer text-sm font-bold"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Skins Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 overflow-y-auto max-h-[55vh] pr-1 z-10 py-1">
              {SKINS.map((skin) => {
                const isUnlocked = unlockedSkins.includes(skin.id);
                const isEquipped = selectedSkin === skin.id;
                const canAfford = coins >= skin.cost;

                return (
                  <motion.div
                    key={skin.id}
                    whileHover={{ scale: 1.02, y: -2 }}
                    className={`glass-panel rounded-2xl p-4 flex flex-col justify-between border transition-all relative ${
                      isEquipped
                        ? 'border-amber-400/40 bg-amber-500/[0.04]'
                        : 'border-white/5 bg-white/[0.02] hover:border-white/15'
                    }`}
                  >
                    {/* Visual Preview Area */}
                    <div
                      className="h-28 rounded-xl flex items-center justify-center mb-3 relative overflow-hidden"
                      style={{
                        background: isEquipped
                          ? 'radial-gradient(circle, rgba(232, 185, 74, 0.12) 0%, transparent 80%)'
                          : 'rgba(0,0,0,0.2)',
                      }}
                    >
                      {/* Emoji Icon of the skin */}
                      <span className="text-4xl filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.3)] animate-pulse">
                        {skin.emoji}
                      </span>
                      
                      {/* Equipped badge */}
                      {isEquipped && (
                        <span className="absolute top-2 right-2 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-400 text-black">
                          Active
                        </span>
                      )}
                    </div>

                    {/* Description Section */}
                    <div className="flex-1 flex flex-col gap-1 mb-4">
                      <h3 className="text-sm font-extrabold text-white">{skin.name}</h3>
                      <p className="text-[10px] text-white/50 leading-relaxed">{skin.description}</p>
                    </div>

                    {/* Buy/Equip Button */}
                    <button
                      onClick={() => handleBuyOrEquip(skin)}
                      disabled={!isUnlocked && !canAfford}
                      className={`w-full py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                        isEquipped
                          ? 'bg-amber-400 text-black hover:bg-amber-300'
                          : isUnlocked
                          ? 'bg-white/10 hover:bg-white/15 text-white border border-white/10'
                          : canAfford
                          ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/10'
                          : 'bg-white/[0.03] text-white/30 border border-white/5 cursor-not-allowed'
                      }`}
                    >
                      {isEquipped ? (
                        <span>Equipped</span>
                      ) : isUnlocked ? (
                        <span>Equip Skin</span>
                      ) : (
                        <>
                          <span>Buy for</span>
                          <span className="font-extrabold">🪙 {skin.cost}</span>
                        </>
                      )}
                    </button>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

import { useState } from 'react'
import GameCanvas from './components/GameCanvas'
import { LEVELS } from './game/levels'
import './App.css'

interface LevelStats {
  timeSeconds: number;
  clicks: number;
}

function App() {
  const [levelIndex, setLevelIndex] = useState(0);
  const [gameState, setGameState] = useState<'MENU' | 'PLAYING' | 'LEVEL_COMPLETE' | 'WON'>('MENU');
  const [levelStats, setLevelStats] = useState<LevelStats>({ timeSeconds: 0, clicks: 0 });

  const startGame = () => {
    setGameState('PLAYING');
  };

  const handleLevelComplete = (stats: LevelStats) => {
    setLevelStats(stats);
    if (levelIndex < LEVELS.length - 1) {
      setGameState('LEVEL_COMPLETE');
    } else {
      setGameState('WON');
    }
  };

  const handleContinue = () => {
    setLevelIndex(prev => prev + 1);
    setGameState('PLAYING');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col font-sans">
      {gameState === 'MENU' && (
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-8 tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            Chaotic Clock Stopper
          </h1>
          <div className="text-center space-y-6 p-8 bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 max-w-md">
            <p className="text-lg text-slate-300">
              Stop all clocks at exactly 12 o'clock. <br />
              When you stop one, the others get faster! <br /><br />
              Click on the stopped clock to refreeze it.
            </p>
            <button
              onClick={startGame}
              className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-full text-xl transition-all transform hover:scale-105 shadow-lg shadow-blue-500/30"
            >
              Start Game
            </button>
          </div>
        </div>
      )}

      {gameState === 'PLAYING' && (
        <div className="flex-1 flex flex-col">
          <div className="text-center py-4">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-300">
              Level {levelIndex + 1} / {LEVELS.length}
            </h2>
          </div>
          <div className="flex-1">
            <GameCanvas
              key={levelIndex} // Re-mount on level change
              level={LEVELS[levelIndex]}
              onLevelComplete={handleLevelComplete}
              onGameOver={() => { }}
            />
          </div>
        </div>
      )}

      {gameState === 'LEVEL_COMPLETE' && (
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="text-center space-y-6 p-12 bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 max-w-md">
            <h2 className="text-4xl font-bold text-green-400">Level {levelIndex + 1} Completed!</h2>
            <div className="space-y-3 text-slate-300">
              <div className="text-2xl">
                <span className="text-slate-400">Time:</span> <span className="font-bold text-white">{levelStats.timeSeconds.toFixed(1)}s</span>
              </div>
              <div className="text-2xl">
                <span className="text-slate-400">Clicks:</span> <span className="font-bold text-white">{levelStats.clicks}</span>
              </div>
            </div>
            <button
              onClick={handleContinue}
              className="px-12 py-5 bg-green-600 hover:bg-green-500 text-white font-bold rounded-full text-2xl transition-all transform hover:scale-105 shadow-lg shadow-green-500/30"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {gameState === 'WON' && (
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-8 tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            Chaotic Clock Stopper
          </h1>
          <div className="text-center space-y-6 p-8 bg-slate-800 rounded-2xl shadow-2xl border border-slate-700">
            <h2 className="text-3xl font-bold text-green-400">You Won!</h2>
            <p className="text-slate-300">You have mastered the chaos of time.</p>
            <div className="text-xl text-slate-300">
              <div>Final Level Time: <span className="font-bold text-white">{levelStats.timeSeconds.toFixed(1)}s</span></div>
              <div>Final Level Clicks: <span className="font-bold text-white">{levelStats.clicks}</span></div>
            </div>
            <button
              onClick={() => {
                setLevelIndex(0);
                setGameState('MENU');
              }}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-full transition-all"
            >
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App

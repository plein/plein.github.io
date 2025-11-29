import { useState } from 'react'
import GameCanvas from './components/GameCanvas'
import { LEVELS } from './game/levels'
import './App.css'

function App() {
  const [levelIndex, setLevelIndex] = useState(0);
  const [gameState, setGameState] = useState<'MENU' | 'PLAYING' | 'WON'>('MENU');

  const startGame = () => {
    setGameState('PLAYING');
  };

  const handleLevelComplete = () => {
    if (levelIndex < LEVELS.length - 1) {
      setLevelIndex(prev => prev + 1);
      // Briefly show some "Level Complete" message or just continue?
      // For now, let's just continue seamlessly or maybe show a quick flash.
      // But re-mounting GameCanvas will reset clocks.
    } else {
      setGameState('WON');
    }
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
              When you stop one, the others get faster!
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

      {gameState === 'WON' && (
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-8 tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            Chaotic Clock Stopper
          </h1>
          <div className="text-center space-y-6 p-8 bg-slate-800 rounded-2xl shadow-2xl border border-slate-700">
            <h2 className="text-3xl font-bold text-green-400">You Won!</h2>
            <p className="text-slate-300">You have mastered the chaos of time.</p>
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

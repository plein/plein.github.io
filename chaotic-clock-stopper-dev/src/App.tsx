import { useState, useEffect, useRef } from 'react'
import { StatsigProvider, useClientAsyncInit, useStatsigClient } from '@statsig/react-bindings'
import GameCanvas from './components/GameCanvas'
import { LEVELS } from './game/levels'
import './App.css'

const STATSIG_CLIENT_KEY = 'client-PAiDXAoAsC4GyQKPhcunwlpT2fssF9CHaeV1vkcbuSX';

interface LevelStats {
  timeSeconds: number;
  clicks: number;
}

interface HighScore {
  level: number;
  date: string;
}

function GameContent() {
  const { client } = useStatsigClient();
  const [levelIndex, setLevelIndex] = useState(0);
  const [gameState, setGameState] = useState<'MENU' | 'PLAYING' | 'LEVEL_COMPLETE' | 'WON' | 'SURVIVAL_OVER'>('MENU');
  const [gameMode, setGameMode] = useState<'NORMAL' | 'SURVIVAL'>('NORMAL');
  const [levelStats, setLevelStats] = useState<LevelStats>({ timeSeconds: 0, clicks: 0 });

  // Survival Mode State
  const [survivalTimeLeft, setSurvivalTimeLeft] = useState(300); // 5 minutes in seconds
  const totalSurvivalClicksRef = useRef(0);
  const [highScores, setHighScores] = useState<HighScore[]>(() => {
    const saved = localStorage.getItem('ccs_highscores');
    return saved ? JSON.parse(saved) : [];
  });

  // Survival Timer
  useEffect(() => {
    let interval: number;
    if (gameState === 'PLAYING' && gameMode === 'SURVIVAL') {
      interval = setInterval(() => {
        setSurvivalTimeLeft(prev => {
          if (prev <= 1) {
            setGameState('SURVIVAL_OVER');
            saveHighScore(levelIndex + 1);
            client.logEvent('survival_mode_end', undefined, {
              endLevel: String(levelIndex + 1),
              totalClicks: String(totalSurvivalClicksRef.current)
            });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState, gameMode, levelIndex, client]);

  const saveHighScore = (level: number) => {
    const newScore: HighScore = { level, date: new Date().toLocaleDateString() };
    const newScores = [...highScores, newScore]
      .sort((a, b) => b.level - a.level)
      .slice(0, 10);
    setHighScores(newScores);
    localStorage.setItem('ccs_highscores', JSON.stringify(newScores));
  };

  const startGame = (mode: 'NORMAL' | 'SURVIVAL') => {
    setGameMode(mode);
    setLevelIndex(0);
    if (mode === 'SURVIVAL') {
      setSurvivalTimeLeft(300);
      totalSurvivalClicksRef.current = 0;
    }
    setGameState('PLAYING');
    client.logEvent('game_start', undefined, { gameMode: mode });
  };

  const handleLevelComplete = (stats: LevelStats) => {
    setLevelStats(stats);

    client.logEvent('level_completed', undefined, {
      level: String(levelIndex + 1),
      timeSeconds: String(stats.timeSeconds),
      clicks: String(stats.clicks),
      gameMode: gameMode
    });

    if (gameMode === 'SURVIVAL') {
      totalSurvivalClicksRef.current += stats.clicks;
      // In survival, just go to next level immediately or show brief flash?
      // User said "Timer must be paused during level transition and show in the level completion page"
      // So we show the completion page.
      if (levelIndex < LEVELS.length - 1) {
        setGameState('LEVEL_COMPLETE');
      } else {
        // Completed all levels in survival!
        setGameState('WON');
        saveHighScore(LEVELS.length);
        client.logEvent('survival_mode_end', undefined, {
          endLevel: String(LEVELS.length),
          totalClicks: String(totalSurvivalClicksRef.current)
        });
      }
    } else {
      // Normal mode
      if (levelIndex < LEVELS.length - 1) {
        setGameState('LEVEL_COMPLETE');
      } else {
        setGameState('WON');
      }
    }
  };

  const handleContinue = () => {
    setLevelIndex(prev => prev + 1);
    setGameState('PLAYING');
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col font-sans">
      {gameState === 'MENU' && (
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <img
            src="/logo.png"
            alt="Chaotic Clock Stopper"
            className="w-full max-w-md mb-8 rounded-2xl"
          />
          <div className="text-center space-y-6 p-8 bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 max-w-md w-full">
            <p className="text-lg text-slate-300">
              Stop all clocks at exactly 12 o'clock. <br />
              When you stop one, the others get faster! <br /><br />
              Click on the stopped clock to refreeze it.
            </p>
            <div className="flex flex-row gap-4">
              <button
                onClick={() => startGame('NORMAL')}
                className="flex-1 px-10 py-6 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-full text-2xl transition-all transform hover:scale-105 shadow-lg shadow-blue-500/30"
              >
                Normal Mode
              </button>
              <button
                onClick={() => startGame('SURVIVAL')}
                className="flex-1 px-10 py-6 bg-red-600 hover:bg-red-500 text-white font-bold rounded-full text-2xl transition-all transform hover:scale-105 shadow-lg shadow-red-500/30"
              >
                Survival Mode
              </button>
            </div>
            {highScores.length > 0 && (
              <div className="mt-8 pt-6 border-t border-slate-700">
                <h3 className="text-xl font-bold text-slate-400 mb-4">Survival High Scores</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {highScores.map((score, i) => (
                    <div key={i} className="flex justify-between text-slate-300 text-sm">
                      <span>#{i + 1} {score.date}</span>
                      <span className="font-bold text-white">Level {score.level}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {gameState === 'PLAYING' && (
        <div className="flex-1 flex flex-col">
          <div className="text-center py-4 relative">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-300">
              Level {levelIndex + 1} / {LEVELS.length}
            </h2>
            {gameMode === 'SURVIVAL' && (
              <div className={`text-xl font-mono mt-1 ${survivalTimeLeft < 60 ? 'text-red-400 animate-pulse' : 'text-blue-400'}`}>
                Time Left: {formatTime(survivalTimeLeft)}
              </div>
            )}
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
              {gameMode === 'SURVIVAL' && (
                <div className="text-2xl pt-4 border-t border-slate-700 mt-4">
                  <span className="text-slate-400">Survival Timer:</span> <br />
                  <span className={`font-mono font-bold ${survivalTimeLeft < 60 ? 'text-red-400' : 'text-blue-400'}`}>
                    {formatTime(survivalTimeLeft)}
                  </span>
                </div>
              )}
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

      {gameState === 'SURVIVAL_OVER' && (
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-8 tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-500">
            Time's Up!
          </h1>
          <div className="text-center space-y-6 p-8 bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 max-w-md w-full">
            <div className="text-3xl font-bold text-white mb-4">
              You reached <span className="text-blue-400">Level {levelIndex + 1}</span>
            </div>

            <div className="border-t border-slate-700 pt-6">
              <h3 className="text-xl font-bold text-slate-400 mb-4">Top 10 Scores</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {highScores.map((score, i) => (
                  <div key={i} className={`flex justify-between p-2 rounded ${score.level === levelIndex + 1 && i === highScores.findIndex(s => s.level === levelIndex + 1 && s.date === new Date().toLocaleDateString()) ? 'bg-slate-700 border border-slate-600' : 'text-slate-300'}`}>
                    <span>#{i + 1} {score.date}</span>
                    <span className="font-bold text-white">Level {score.level}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                setLevelIndex(0);
                setGameState('MENU');
              }}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-full transition-all w-full"
            >
              Back to Menu
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
            {gameMode === 'SURVIVAL' && (
              <div className="mt-4 p-4 bg-slate-700 rounded-lg">
                <div className="text-yellow-400 font-bold text-xl">SURVIVAL COMPLETED!</div>
                <div className="text-slate-300">Time Remaining: {formatTime(survivalTimeLeft)}</div>
              </div>
            )}
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

function App() {
  const { client } = useClientAsyncInit(
    STATSIG_CLIENT_KEY,
    { userID: '' }
  );

  return (
    <StatsigProvider client={client} loadingComponent={<div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">Loading...</div>}>
      <GameContent />
    </StatsigProvider>
  );
}

export default App

export interface Clock {
    id: number;
    x: number;
    y: number;
    radius: number;
    angle: number; // degrees
    baseSpeed: number; // original degrees per second (before increments)
    speed: number; // current degrees per second (with increments)
    stoppedUntil: number; // timestamp, 0 if running
    successfullyStopped: boolean; // true only for successful stops, false for auto-pauses
}

export interface ClockConfig {
    speedMultiplier: number;
    direction: 1 | -1;
}

export interface MissPenalty {
    maxMisses: number;
    durationMs: number;
}

export interface Level {
    baseSpeedRps: number;
    clockConfigs?: ClockConfig[]; // If present, determines numClocks
    numClocks?: number; // Fallback if clockConfigs not present
    stopDurationMs: number;
    speedIncrementPercent: number;
    toleranceDegrees: number;
    missPenalty?: MissPenalty;
    missAutoPauseDurationMs?: number; // Auto-pause duration on wrong-time click (default 120ms)
}

export interface GameState {
    clocks: Clock[];
    level: Level;
    isPlaying: boolean;
    score: number;
    levelIndex: number;
    lastFrameTime: number;
}

import type { Level } from './types';

export const LEVELS: Level[] = [
    {
        // L1: Tutorial - 2 slow clocks, huge tolerance, very forgiving
        baseSpeedRps: 0.25,
        numClocks: 2,
        clockConfigs: [
            { speedMultiplier: 1, direction: 1 },
            { speedMultiplier: 1, direction: 1 },
        ],
        stopDurationMs: 5000,
        speedIncrementPercent: 0.05,
        toleranceDegrees: 20,
        missPenalty: { maxMisses: 999, durationMs: 500 },
        missAutoPauseDurationMs: 150,
    },
    {
        // L2: Introduce opposite direction
        baseSpeedRps: 0.3,
        numClocks: 2,
        clockConfigs: [
            { speedMultiplier: 1, direction: 1 },
            { speedMultiplier: 1, direction: -1 },
        ],
        stopDurationMs: 4500,
        speedIncrementPercent: 0.06,
        toleranceDegrees: 18,
        missPenalty: { maxMisses: 10, durationMs: 800 },
        missAutoPauseDurationMs: 140,
    },
    {
        // L3: Add a 3rd clock, small buff to speed
        baseSpeedRps: 0.35,
        numClocks: 3,
        clockConfigs: [
            { speedMultiplier: 1, direction: 1 },
            { speedMultiplier: 1, direction: -1 },
            { speedMultiplier: 1, direction: 1 },
        ],
        stopDurationMs: 4200,
        speedIncrementPercent: 0.07,
        toleranceDegrees: 18,
        missPenalty: { maxMisses: 10, durationMs: 900 },
        missAutoPauseDurationMs: 130,
    },
    {
        // L4: Slightly faster, same 3 clocks
        baseSpeedRps: 0.4,
        numClocks: 3,
        stopDurationMs: 4000,
        speedIncrementPercent: 0.08,
        toleranceDegrees: 16,
        missPenalty: { maxMisses: 10, durationMs: 900 },
        missAutoPauseDurationMs: 120,
    },
    {
        // L5: 4 clocks, mixed directions
        baseSpeedRps: 0.45,
        numClocks: 4,
        clockConfigs: [
            { speedMultiplier: 1, direction: 1 },
            { speedMultiplier: 1, direction: -1 },
            { speedMultiplier: 1, direction: 1 },
            { speedMultiplier: 1, direction: -1 },
        ],
        stopDurationMs: 3800,
        speedIncrementPercent: 0.09,
        toleranceDegrees: 16,
        missPenalty: { maxMisses: 8, durationMs: 1000 },
        missAutoPauseDurationMs: 115,
    },
    {
        // L6: 4 clocks, higher base speed, small tolerance shrink
        baseSpeedRps: 0.5,
        numClocks: 4,
        stopDurationMs: 3600,
        speedIncrementPercent: 0.10,
        toleranceDegrees: 15,
        missPenalty: { maxMisses: 8, durationMs: 1000 },
        missAutoPauseDurationMs: 110,
    },
    {
        // L7: 5 clocks, first taste of chaos
        baseSpeedRps: 0.55,
        numClocks: 5,
        stopDurationMs: 3400,
        speedIncrementPercent: 0.11,
        toleranceDegrees: 14,
        missPenalty: { maxMisses: 7, durationMs: 1100 },
        missAutoPauseDurationMs: 105,
    },
    {
        // L8: 5 clocks, mixed multipliers
        baseSpeedRps: 0.6,
        clockConfigs: [
            { speedMultiplier: 0.9, direction: 1 },
            { speedMultiplier: 1.1, direction: -1 },
            { speedMultiplier: 1.0, direction: 1 },
            { speedMultiplier: 1.2, direction: -1 },
            { speedMultiplier: 0.8, direction: 1 },
        ],
        stopDurationMs: 3200,
        speedIncrementPercent: 0.12,
        toleranceDegrees: 13,
        missPenalty: { maxMisses: 7, durationMs: 1100 },
        missAutoPauseDurationMs: 100,
    },
    {
        // L9: 6 clocks, faster and tighter
        baseSpeedRps: 0.65,
        numClocks: 6,
        stopDurationMs: 3000,
        speedIncrementPercent: 0.13,
        toleranceDegrees: 12,
        missPenalty: { maxMisses: 6, durationMs: 1200 },
        missAutoPauseDurationMs: 95,
    },
    {
        // L10: 6 clocks, more chaos multipliers
        baseSpeedRps: 0.7,
        clockConfigs: [
            { speedMultiplier: 0.8, direction: 1 },
            { speedMultiplier: 1.2, direction: -1 },
            { speedMultiplier: 1.0, direction: 1 },
            { speedMultiplier: 1.4, direction: -1 },
            { speedMultiplier: 0.9, direction: 1 },
            { speedMultiplier: 1.1, direction: -1 },
        ],
        stopDurationMs: 2900,
        speedIncrementPercent: 0.14,
        toleranceDegrees: 12,
        missPenalty: { maxMisses: 6, durationMs: 1300 },
        missAutoPauseDurationMs: 90,
    },
    {
        // L11: 6 clocks, snappier pauses and smaller window
        baseSpeedRps: 0.75,
        numClocks: 6,
        stopDurationMs: 2700,
        speedIncrementPercent: 0.15,
        toleranceDegrees: 11,
        missPenalty: { maxMisses: 5, durationMs: 1400 },
        missAutoPauseDurationMs: 90,
    },
    {
        // L12: 7 clocks, real chaos begins
        baseSpeedRps: 0.8,
        numClocks: 7,
        stopDurationMs: 2600,
        speedIncrementPercent: 0.16,
        toleranceDegrees: 10,
        missPenalty: { maxMisses: 5, durationMs: 1500 },
        missAutoPauseDurationMs: 85,
    },
    {
        // L13: 7 clocks, mixed multipliers & directions
        baseSpeedRps: 0.85,
        clockConfigs: [
            { speedMultiplier: 0.85, direction: 1 },
            { speedMultiplier: 1.3, direction: -1 },
            { speedMultiplier: 1.0, direction: 1 },
            { speedMultiplier: 1.5, direction: -1 },
            { speedMultiplier: 0.9, direction: 1 },
            { speedMultiplier: 1.1, direction: -1 },
            { speedMultiplier: 1.2, direction: 1 },
        ],
        stopDurationMs: 2500,
        speedIncrementPercent: 0.17,
        toleranceDegrees: 10,
        missPenalty: { maxMisses: 4, durationMs: 1600 },
        missAutoPauseDurationMs: 85,
    },
    {
        // L14: 7 clocks, faster base, tighter window
        baseSpeedRps: 0.9,
        numClocks: 7,
        stopDurationMs: 2400,
        speedIncrementPercent: 0.18,
        toleranceDegrees: 9,
        missPenalty: { maxMisses: 4, durationMs: 1700 },
        missAutoPauseDurationMs: 80,
    },
    {
        // L15: 8 clocks, high chaos
        baseSpeedRps: 0.95,
        numClocks: 8,
        stopDurationMs: 2300,
        speedIncrementPercent: 0.19,
        toleranceDegrees: 8,
        missPenalty: { maxMisses: 4, durationMs: 1800 },
        missAutoPauseDurationMs: 80,
    },
    {
        // L16: 8 clocks, mixed multipliers for unpredictability
        baseSpeedRps: 1.0,
        clockConfigs: [
            { speedMultiplier: 0.8, direction: 1 },
            { speedMultiplier: 1.4, direction: -1 },
            { speedMultiplier: 1.1, direction: 1 },
            { speedMultiplier: 1.6, direction: -1 },
            { speedMultiplier: 0.9, direction: 1 },
            { speedMultiplier: 1.2, direction: -1 },
            { speedMultiplier: 1.3, direction: 1 },
            { speedMultiplier: 0.95, direction: -1 },
        ],
        stopDurationMs: 2200,
        speedIncrementPercent: 0.20,
        toleranceDegrees: 8,
        missPenalty: { maxMisses: 3, durationMs: 1900 },
        missAutoPauseDurationMs: 75,
    },
    {
        // L17: 8 clocks, faster & shorter stop window
        baseSpeedRps: 1.05,
        numClocks: 8,
        stopDurationMs: 2100,
        speedIncrementPercent: 0.20,
        toleranceDegrees: 7,
        missPenalty: { maxMisses: 3, durationMs: 2000 },
        missAutoPauseDurationMs: 75,
    },
    {
        // L18: 8 clocks, high base speed
        baseSpeedRps: 1.1,
        numClocks: 8,
        stopDurationMs: 2000,
        speedIncrementPercent: 0.21,
        toleranceDegrees: 6,
        missPenalty: { maxMisses: 3, durationMs: 2100 },
        missAutoPauseDurationMs: 70,
    },
    {
        // L19: 8 clocks, tight window and strong increments
        baseSpeedRps: 1.15,
        numClocks: 8,
        stopDurationMs: 1900,
        speedIncrementPercent: 0.22,
        toleranceDegrees: 5,
        missPenalty: { maxMisses: 2, durationMs: 2200 },
        missAutoPauseDurationMs: 70,
    },
    {
        // L20: Final chaos - fast, tight, low forgiveness
        baseSpeedRps: 1.2,
        clockConfigs: [
            { speedMultiplier: 0.8, direction: 1 },
            { speedMultiplier: 1.5, direction: -1 },
            { speedMultiplier: 1.1, direction: 1 },
            { speedMultiplier: 1.7, direction: -1 },
            { speedMultiplier: 0.9, direction: 1 },
            { speedMultiplier: 1.3, direction: -1 },
            { speedMultiplier: 1.4, direction: 1 },
            { speedMultiplier: 1.0, direction: -1 },
        ],
        stopDurationMs: 1800,
        speedIncrementPercent: 0.22,
        toleranceDegrees: 5,
        missPenalty: { maxMisses: 2, durationMs: 2300 },
        missAutoPauseDurationMs: 70,
    },
];

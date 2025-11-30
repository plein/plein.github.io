import type { Clock, Level } from './types';

export const createClocks = (level: Level, width: number, height: number): Clock[] => {
    const clocks: Clock[] = [];
    const numClocks = level.clockConfigs ? level.clockConfigs.length : (level.numClocks || 3);

    const cols = Math.ceil(Math.sqrt(numClocks));
    const rows = Math.ceil(numClocks / cols);

    const cellWidth = width / cols;
    const cellHeight = height / rows;
    const radius = Math.min(cellWidth, cellHeight) * 0.42; // Increased from 0.35 for better mobile visibility

    for (let i = 0; i < numClocks; i++) {
        const col = i % cols;
        const row = Math.floor(i / cols);

        const centerX = col * cellWidth + cellWidth / 2;
        const centerY = row * cellHeight + cellHeight / 2;

        let speed: number;

        if (level.clockConfigs && level.clockConfigs[i]) {
            const config = level.clockConfigs[i];
            speed = level.baseSpeedRps * config.speedMultiplier * 360 * config.direction;
        } else {
            // Fallback random generation
            // Use baseSpeedRps +/- 20%
            const speedRps = level.baseSpeedRps * (0.8 + Math.random() * 0.4);
            const direction = Math.random() < 0.5 ? 1 : -1;
            speed = speedRps * 360 * direction;
        }

        clocks.push({
            id: i,
            x: centerX,
            y: centerY,
            radius,
            angle: Math.random() * 360,
            baseSpeed: speed,
            speed: speed,
            stoppedUntil: 0,
            successfullyStopped: false,
        });
    }
    return clocks;
};

export const updateClocks = (clocks: Clock[], deltaSeconds: number, now: number): Clock[] => {
    return clocks.map(clock => {
        if (clock.stoppedUntil > now) {
            return clock; // Still stopped (or auto-paused)
        }

        // If it was stopped and just woke up, it resumes naturally
        // Update angle
        let newAngle = clock.angle + clock.speed * deltaSeconds;
        // Normalize to 0-360
        newAngle = newAngle % 360;
        if (newAngle < 0) newAngle += 360;

        return {
            ...clock,
            angle: newAngle,
        };
    });
};

export const checkHit = (clocks: Clock[], x: number, y: number, level: Level, now: number): { hitClockId: number | null, success: boolean } => {
    for (const clock of clocks) {
        const dx = x - clock.x;
        const dy = y - clock.y;
        if (dx * dx + dy * dy <= clock.radius * clock.radius) {
            // Clicked on this clock

            // Check if already stopped
            if (clock.stoppedUntil > now) {
                return { hitClockId: clock.id, success: false }; // Already stopped, ignore or treat as miss? User said "Stop all clocks", usually tapping a stopped clock does nothing.
            }

            // Check angle tolerance
            // 12 o'clock is 0 degrees (assuming 0 is up). 
            // Usually 0 is right in canvas arc. We need to define coordinate system.
            // Let's say 0 is UP (12 o'clock).
            // If we render 0 as UP, then we check deviation from 0.

            // Normalize angle to -180 to 180 for easier distance check from 0
            let angle = clock.angle;
            if (angle > 180) angle -= 360;

            if (Math.abs(angle) <= level.toleranceDegrees) {
                return { hitClockId: clock.id, success: true };
            } else {
                return { hitClockId: clock.id, success: false };
            }
        }
    }
    return { hitClockId: null, success: false };
};

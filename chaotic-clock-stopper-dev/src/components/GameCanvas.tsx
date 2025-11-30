import React, { useEffect, useRef } from 'react';
import type { Clock, Level } from '../game/types';
import { createClocks, updateClocks, checkHit } from '../game/engine';

interface LevelStats {
    timeSeconds: number;
    clicks: number;
}

interface GameCanvasProps {
    level: Level;
    onLevelComplete: (stats: LevelStats) => void;
    onGameOver: () => void; // Not strictly used if infinite attempts, but good to have
}

const GameCanvas: React.FC<GameCanvasProps> = ({ level, onLevelComplete }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    // Use ref for game state to avoid react render cycle lag
    const clocksRef = useRef<Clock[]>([]);
    const requestRef = useRef<number>(0);
    const previousTimeRef = useRef<number>(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const [canvasSize, setCanvasSize] = React.useState({ width: 800, height: 600 });

    // Stats tracking
    const startTimeRef = useRef<number>(Date.now());
    const clickCountRef = useRef<number>(0);

    // Initialize clocks and set canvas size
    useEffect(() => {
        if (containerRef.current) {
            const { clientWidth, clientHeight } = containerRef.current;
            setCanvasSize({ width: clientWidth, height: clientHeight });
            clocksRef.current = createClocks(level, clientWidth, clientHeight);
        }
    }, [level]);

    const previousStoppedCountRef = useRef<number>(0);

    const animate = (time: number) => {
        if (previousTimeRef.current !== undefined) {
            const deltaTime = (time - previousTimeRef.current) / 1000;
            const now = Date.now();

            // Check if any clock just resumed (stoppedUntil expired)
            const currentStoppedCount = clocksRef.current.filter(c => c.stoppedUntil > now).length;
            if (currentStoppedCount < previousStoppedCountRef.current) {
                // A clock just resumed, reset all speeds to base
                clocksRef.current = clocksRef.current.map(c => ({
                    ...c,
                    speed: c.baseSpeed
                }));
            }
            previousStoppedCountRef.current = currentStoppedCount;

            // Update physics
            clocksRef.current = updateClocks(clocksRef.current, deltaTime, now);

            // Check win condition
            const allStopped = clocksRef.current.every(c => c.stoppedUntil > now);
            if (allStopped && clocksRef.current.length > 0) {
                // We'll handle this in the render loop or a separate check, 
                // but calling onLevelComplete here might be too frequent.
                // Let's just rely on the fact that the loop continues.
                // We can use a flag or just check it in a separate interval/effect if we were using state.
                // Since we are in a ref, we can just call it once.
                // But we need to be careful not to call it multiple times.
                // For now, let's just let the user see they won and maybe click a button or wait?
                // Actually, the original code had a useEffect for this.
                // We can't use useEffect on ref changes.
                // So we should check it here and maybe set a flag in a ref to only call it once.
            }

            // Draw
            draw(now);
        }
        previousTimeRef.current = time;
        requestRef.current = requestAnimationFrame(animate);
    };

    const draw = (now: number) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw Lock Overlay if locked
        if (now < inputLockedUntilRef.current) {
            ctx.fillStyle = 'rgba(239, 68, 68, 0.1)'; // Red tint
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.font = 'bold 48px Inter, sans-serif';
            ctx.fillStyle = '#ef4444';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('LOCKED', canvas.width / 2, canvas.height / 2);
        }

        clocksRef.current.forEach(clock => {
            const isStopped = clock.stoppedUntil > now;

            // Draw Safe Zone (Tolerance) as a filled wedge
            // 0 degrees is UP (12 o'clock). Canvas 0 is RIGHT.
            // So UP is -90 degrees (or 270).
            // We want to draw a wedge around UP.
            // Start angle: -90 - tolerance
            // End angle: -90 + tolerance
            const toleranceRad = level.toleranceDegrees * (Math.PI / 180);
            const startAngle = -Math.PI / 2 - toleranceRad;
            const endAngle = -Math.PI / 2 + toleranceRad;

            ctx.beginPath();
            ctx.moveTo(clock.x, clock.y); // Start at center
            ctx.arc(clock.x, clock.y, clock.radius - 5, startAngle, endAngle);
            ctx.closePath();
            ctx.fillStyle = 'rgba(74, 222, 128, 0.25)'; // Semi-transparent green
            ctx.fill();

            // Draw border for the safe zone
            ctx.beginPath();
            ctx.arc(clock.x, clock.y, clock.radius - 5, startAngle, endAngle);
            ctx.strokeStyle = 'rgba(74, 222, 128, 0.6)'; // Brighter green border
            ctx.lineWidth = 3;
            ctx.stroke();

            // Draw Clock Face
            ctx.beginPath();
            ctx.arc(clock.x, clock.y, clock.radius, 0, 2 * Math.PI);
            // Green if stopped, white if running
            // User requested blue for freeze ring, let's use blue for stopped state too
            ctx.strokeStyle = isStopped ? '#3b82f6' : '#ffffff'; // Blue if stopped
            ctx.lineWidth = 4;
            ctx.stroke();

            // Draw Radial Freeze Timer (only if successfully stopped)
            if (clock.successfullyStopped && isStopped) {
                const remainingTime = clock.stoppedUntil - now;
                // Calculate fraction relative to stopDurationMs
                const fraction = Math.max(0, remainingTime / level.stopDurationMs);

                if (fraction > 0) {
                    ctx.beginPath();
                    // Start from top (-PI/2) and go clockwise
                    ctx.arc(clock.x, clock.y, clock.radius + 8, -Math.PI / 2, -Math.PI / 2 + (fraction * 2 * Math.PI));
                    ctx.strokeStyle = '#3b82f6'; // Blue freeze ring
                    ctx.lineWidth = 3;
                    ctx.stroke();
                }
            }

            // Draw 12 o'clock marker
            ctx.beginPath();
            ctx.moveTo(clock.x, clock.y - clock.radius + 10);
            ctx.lineTo(clock.x, clock.y - clock.radius - 5);
            ctx.strokeStyle = '#ef4444'; // Red marker
            ctx.lineWidth = 3;
            ctx.stroke();

            // Draw Hand
            // 0 degrees is UP (12 o'clock). 
            // Canvas arc 0 is RIGHT (3 o'clock).
            // So we need to subtract 90 degrees (PI/2) when drawing.
            const angleRad = (clock.angle - 90) * (Math.PI / 180);

            ctx.beginPath();
            ctx.moveTo(clock.x, clock.y);
            ctx.lineTo(
                clock.x + Math.cos(angleRad) * (clock.radius - 10),
                clock.y + Math.sin(angleRad) * (clock.radius - 10)
            );
            ctx.strokeStyle = isStopped ? '#3b82f6' : '#ffffff'; // Blue if stopped
            ctx.lineWidth = 3;
            ctx.stroke();

            // Center dot
            ctx.beginPath();
            ctx.arc(clock.x, clock.y, 4, 0, 2 * Math.PI);
            ctx.fillStyle = '#ffffff';
            ctx.fill();
        });
    };

    useEffect(() => {
        requestRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(requestRef.current);
    }, []);

    // Check win condition periodically to avoid spamming
    useEffect(() => {
        const interval = setInterval(() => {
            const now = Date.now();
            // Check if all clocks are successfully stopped (not just auto-paused)
            if (clocksRef.current.length > 0 && clocksRef.current.every(c => c.successfullyStopped && c.stoppedUntil > now)) {
                const timeSeconds = (now - startTimeRef.current) / 1000;
                onLevelComplete({ timeSeconds, clicks: clickCountRef.current });
            }
        }, 500);
        return () => clearInterval(interval);
    }, [onLevelComplete]);

    const missCountRef = useRef<number>(0);
    const inputLockedUntilRef = useRef<number>(0);

    const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        clickCountRef.current += 1;
        const now = Date.now();

        // Check input lock
        if (now < inputLockedUntilRef.current) {
            return; // Input locked
        }

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Use current ref state for hit detection
        const { hitClockId, success } = checkHit(clocksRef.current, x, y, level, now);

        if (hitClockId !== null) {
            const clickedClock = clocksRef.current.find(c => c.id === hitClockId);

            // If clock is already stopped, refreeze it (reset timer)
            if (clickedClock && clickedClock.stoppedUntil > now && clickedClock.successfullyStopped) {
                clocksRef.current = clocksRef.current.map(c => {
                    if (c.id === hitClockId) {
                        return { ...c, stoppedUntil: now + level.stopDurationMs };
                    }
                    return c;
                });
                return;
            }

            // If clock is auto-paused (miss penalty), ignore click
            if (clickedClock && clickedClock.stoppedUntil > now && !clickedClock.successfullyStopped) {
                return;
            }

            if (success) {
                // Successful stop at right time
                clocksRef.current = clocksRef.current.map(c => {
                    if (c.id === hitClockId) {
                        // Stop the clicked clock and mark as successfully stopped
                        return { ...c, stoppedUntil: now + level.stopDurationMs, successfullyStopped: true };
                    } else if (c.stoppedUntil <= now) {
                        // Speed up others that are running (only if they are not stopped)
                        return { ...c, speed: c.speed * (1 + level.speedIncrementPercent) };
                    }
                    return c;
                });
                missCountRef.current = 0;
            } else {
                // Wrong time - auto-pause the clock briefly (NOT a successful stop)
                const autoPauseDuration = level.missAutoPauseDurationMs || 120;
                clocksRef.current = clocksRef.current.map(c => {
                    if (c.id === hitClockId) {
                        return { ...c, stoppedUntil: now + autoPauseDuration, successfullyStopped: false };
                    }
                    return c;
                });
                handleMiss(now);
            }
        } else {
            // Miss (didn't hit any clock)
            handleMiss(now);
        }
    };

    const handleMiss = (now: number) => {
        if (!level.missPenalty) return;

        missCountRef.current += 1;
        if (missCountRef.current >= level.missPenalty.maxMisses) {
            inputLockedUntilRef.current = now + level.missPenalty.durationMs;
            missCountRef.current = 0;
        }
    };

    return (
        <div ref={containerRef} className="w-full h-full">
            <canvas
                ref={canvasRef}
                width={canvasSize.width}
                height={canvasSize.height}
                onClick={handleCanvasClick}
                className="cursor-pointer w-full h-full"
            />
        </div>
    );
};

export default GameCanvas;

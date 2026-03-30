//import React from 'react';
//import PageBase from "../../components/base-components/PageBase";


// states: Stopped, Running, Idle
import React, { useState, useRef, useCallback, useEffect } from 'react';
import PageBase from '../../components/base-components/PageBase';

type TimerState = 'idle' | 'running' | 'stopped';

interface Lap {
  lapNumber: number;
  duration: number; // milliseconds
}

function formatTime(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const centiseconds = Math.floor((ms % 1000) / 10);
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(centiseconds).padStart(2, '0')}`;
}

const TimerPage: React.FC = () => {
  const [timerState, setTimerState] = useState<TimerState>('idle');
  const [elapsed, setElapsed] = useState<number>(0);
  const [lapElapsed, setLapElapsed] = useState<number>(0);
  const [laps, setLaps] = useState<Lap[]>([]);

  const startTimeRef = useRef<number>(0);
  const accumulatedRef = useRef<number>(0);
  const lapStartRef = useRef<number>(0);
  const lapAccumulatedRef = useRef<number>(0);
  const rafRef = useRef<number>(0);
  const lapsRef = useRef<Lap[]>([]);

  lapsRef.current = laps;

  const tick = useCallback(() => {
    const now = Date.now();
    setElapsed(accumulatedRef.current + (now - startTimeRef.current));
    setLapElapsed(lapAccumulatedRef.current + (now - lapStartRef.current));
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const handleStart = () => {
    const now = Date.now();
    startTimeRef.current = now;
    lapStartRef.current = now;
    setTimerState('running');
    rafRef.current = requestAnimationFrame(tick);
  };

  const handleStop = () => {
    cancelAnimationFrame(rafRef.current);
    const now = Date.now();
    accumulatedRef.current += now - startTimeRef.current;
    lapAccumulatedRef.current += now - lapStartRef.current;
    setTimerState('stopped');
  };

  const handleReset = () => {
    cancelAnimationFrame(rafRef.current);
    accumulatedRef.current = 0;
    lapAccumulatedRef.current = 0;
    setElapsed(0);
    setLapElapsed(0);
    setLaps([]);
    setTimerState('idle');
  };

  const handleLap = () => {
    const now = Date.now();
    const lapDuration = lapAccumulatedRef.current + (now - lapStartRef.current);
    const newLap: Lap = {
      lapNumber: lapsRef.current.length + 1,
      duration: lapDuration,
    };
    setLaps(prev => [newLap, ...prev]);
    lapAccumulatedRef.current = 0;
    lapStartRef.current = now;
    setLapElapsed(0);
  };

  useEffect(() => {
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const minDuration = laps.length >= 2 ? Math.min(...laps.map(l => l.duration)) : null;
  const maxDuration = laps.length >= 2 ? Math.max(...laps.map(l => l.duration)) : null;

  const getLapColorClass = (lap: Lap): string => {
    if (laps.length < 2) return 'text-gray-800';
    if (lap.duration === minDuration) return 'text-green-600';
    if (lap.duration === maxDuration) return 'text-red-500';
    return 'text-gray-800';
  };

  return (
    <PageBase>
      <h1>Lap Timer</h1>

      <div className="flex flex-col items-center">
        {/* Main timer display */}
        <div className="text-5xl md:text-8xl font-mono font-thin tabular-nums tracking-tight py-8 text-gray-900">
          {formatTime(elapsed)}
        </div>

        {/* Buttons */}
        <div className="flex gap-12 mb-10">
          {timerState === 'stopped' ? (
            <button
              onClick={handleReset}
              className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gray-700 text-white font-medium hover:bg-gray-600 transition-colors"
            >
              Reset
            </button>
          ) : (
            <button
              onClick={handleLap}
              disabled={timerState === 'idle'}
              className={`w-20 h-20 rounded-full font-medium transition-colors ${
                timerState === 'idle'
                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-700 text-white hover:bg-gray-600'
              }`}
            >
              Lap
            </button>
          )}

          {timerState === 'running' ? (
            <button
              onClick={handleStop}
              className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-red-500 text-white font-medium hover:bg-red-400 transition-colors"
            >
              Stop
            </button>
          ) : (
            <button
              onClick={handleStart}
              className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-green-500 text-white font-medium hover:bg-green-400 transition-colors"
            >
              Start
            </button>
          )}
        </div>

        {/* Lap list */}
        {(laps.length > 0 || timerState !== 'idle') && (
          <div className="w-full max-w-md divide-y divide-gray-200 border-t border-gray-200">
            {timerState !== 'idle' && (
              <div className="flex justify-between py-3 text-gray-400">
                <span className="font-medium">Lap {laps.length + 1}</span>
                <span className="font-mono">{formatTime(lapElapsed)}</span>
              </div>
            )}

            {laps.map(lap => (
              <div
                key={lap.lapNumber}
                className={`flex justify-between py-3 font-medium ${getLapColorClass(lap)}`}
              >
                <span>Lap {lap.lapNumber}</span>
                <span className="font-mono">{formatTime(lap.duration)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageBase>
  );
};

export default TimerPage;

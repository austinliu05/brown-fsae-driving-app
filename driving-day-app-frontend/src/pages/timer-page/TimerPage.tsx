// TimerPage.tsx

/*
Purpose:
- Lap timer page for recording track session data

Design: 
- Replica of the iPhone stopwatch, with a main timer, lap recording, a date and 
  run name identifier and note-taking for each lap and pre-test configs

Functionality: 
- Lets a team member start/stop a timer, record laps, and jot down notes per lap 
  and pre-test configuration details

Note: All timing is done in-browser (no backend needed)
*/

import React, { useState, useRef, useCallback, useEffect } from 'react';
import PageBase from '../../components/base-components/PageBase';

/*
Time state machine logic (simplified): 
    idle     (timer hasn't started yet or was just reset)
    running  (timer is actively recording time)
    stopped  (timer is paused, can either resume or reset from here)
*/
type TimerState = 'idle' | 'running' | 'stopped';

interface Lap {
  lapNumber: number;
  duration: number; // lap time in milliseconds
  notes: string;    // optional notes for lap (configs/specs)
}

// Converts a raw millisecond count into MM:SS.cs format (cs = centiseconds)
// use centiseconds (hundredths of a second) to match how the iPhone stopwatch displays time
function formatTime(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);   
  const centiseconds = Math.floor((ms % 1000) / 10); 
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(centiseconds).padStart(2, '0')}`;
}

const TimerPage: React.FC = () => {
  // --- UI state (determines what gets rendered) ---
  const [timerState, setTimerState] = useState<TimerState>('idle');
  const [elapsed, setElapsed] = useState<number>(0);        // total time on the main clock (ms)
  const [lapElapsed, setLapElapsed] = useState<number>(0);  // time for the current in-progress lap (ms)
  const [laps, setLaps] = useState<Lap[]>([]);              // recorded laps, newest first
  const [preTestConfigs, setPreTestConfigs] = useState<string>('');
  const [runDate, setRunDate] = useState<string>('');
  const [runName, setRunName] = useState<string>('');

  // --- Refs for timing accuracy ---
  /* use refs (not state) for the raw timing values because requestAnimationFrame
     callbacks read these values on every frame. If we used state, the callback would
     capture a stale value from when it was first created and never see updates
  */
  const startTimeRef = useRef<number>(0);       // Date.now() snapshot from when the timer last started
  const accumulatedRef = useRef<number>(0);     // ms banked from previous runs (so Stop → Start resumes correctly)
  const lapStartRef = useRef<number>(0);        // Date.now() snapshot from when the current lap started
  const lapAccumulatedRef = useRef<number>(0);  // ms banked for current lap (same resume logic as above)
  const rafRef = useRef<number>(0);             // handle returned by requestAnimationFrame, needed to cancel it

  /*
  lapsRef mirrors the laps state so handleLap can read the current lap count
  without getting a stale closure value inside the RAF callback
  */
  const lapsRef = useRef<Lap[]>([]);
  lapsRef.current = laps;

  /*
  Animation loop
  - runs at ~60fps via requestAnimationFrame
  - each frame, it recalculates elapsed time as: (time already banked) + (time since last start)
  - then schedules itself again, creating the continuous update loop
  */
  const tick = useCallback(() => {
    const now = Date.now();
    setElapsed(accumulatedRef.current + (now - startTimeRef.current));
    setLapElapsed(lapAccumulatedRef.current + (now - lapStartRef.current));
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  // Records the current timestamp and kicks off the RAF loop
  const handleStart = () => {
    const now = Date.now();
    startTimeRef.current = now;
    lapStartRef.current = now;
    setTimerState('running');
    rafRef.current = requestAnimationFrame(tick);
  };

  // Pauses the timer by canceling the RAF loop and banking the elapsed time so far
  const handleStop = () => {
    cancelAnimationFrame(rafRef.current);
    const now = Date.now();
    accumulatedRef.current += now - startTimeRef.current;
    lapAccumulatedRef.current += now - lapStartRef.current;
    setTimerState('stopped');
  };

  // Wipes back to zero (timer, laps, and the run metadata fields)
  const handleReset = () => {
    cancelAnimationFrame(rafRef.current);
    accumulatedRef.current = 0;
    lapAccumulatedRef.current = 0;
    setElapsed(0);
    setLapElapsed(0);
    setLaps([]);
    setPreTestConfigs('');
    setRunName('');
    setTimerState('idle');
  };

  // Saves the current lap time, resets the lap counter, and keeps the main timer running.
  const handleLap = () => {
    const now = Date.now();
    const lapDuration = lapAccumulatedRef.current + (now - lapStartRef.current);
    const newLap: Lap = {
      lapNumber: lapsRef.current.length + 1,
      duration: lapDuration,
      notes: '',
    };
    setLaps(prev => [newLap, ...prev]); // prepend so the newest lap appears at the top
    lapAccumulatedRef.current = 0;
    lapStartRef.current = now;
    setLapElapsed(0);
  };

  // Updates the notes field for a specific recorded lap by its lap number.
  const updateLapNotes = (lapNumber: number, value: string) => {
    setLaps(prev =>
      prev.map(lap => lap.lapNumber === lapNumber ? { ...lap, notes: value } : lap)
    );
  };

  /*
  - Auto-formats the date input as MM/DD/YYYY while the user types
  - Strips anything that isn't a digit, then inserts slashes at the right positions
  so the user only has to type numbers
  */
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 8);
    let formatted = digits;
    if (digits.length >= 3) {
      formatted = `${digits.slice(0, 2)}/${digits.slice(2)}`;
    }
    if (digits.length >= 5) {
      formatted = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
    }
    setRunDate(formatted);
  };

  /*
  Cancel the animation loop if the user navigates away while the timer is 
  still running, otherwise the RAF loop keeps firing in the background (memory leak)
  */
  useEffect(() => {
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  // Highlight best/worst laps after 2+ recorded laps (otherwise gray)
  const minDuration = laps.length >= 2 ? Math.min(...laps.map(l => l.duration)) : null;
  const maxDuration = laps.length >= 2 ? Math.max(...laps.map(l => l.duration)) : null;

  // Returns a Tailwind text color class: green for the fastest lap, red for the slowest, gray otherwise.
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
        {/* Date and run name — filled in before starting a session */}
        <div className="flex gap-4 w-full max-w-md mb-4">
          <div className="flex flex-col flex-1">
            <label className="text-sm font-medium text-gray-600 mb-1">Date</label>
            <input
              type="text"
              placeholder="MM/DD/YYYY"
              value={runDate}
              onChange={handleDateChange}
              maxLength={10}
              className="border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-700 placeholder-gray-300"
            />
          </div>
          <div className="flex flex-col flex-1">
            <label className="text-sm font-medium text-gray-600 mb-1">Run Name</label>
            <input
              type="text"
              placeholder="e.g. AutoX_1"
              value={runName}
              onChange={e => setRunName(e.target.value)}
              className="border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-700 placeholder-gray-300"
            />
          </div>
        </div>

        {/* Main timer display */}
        <div className="text-5xl md:text-8xl font-mono font-thin tabular-nums tracking-tight py-8 text-gray-900">
          {formatTime(elapsed)}
        </div>

        {/* Control buttons — left button toggles between Lap/Reset, right toggles Start/Stop */}
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
              className={`w-16 h-16 md:w-20 md:h-20 rounded-full font-medium transition-colors ${
                timerState === 'idle'
                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed' // grayed out until timer starts
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

        {/* Lap list (hidden until the timer starts) */}
        {(laps.length > 0 || timerState !== 'idle') && (
          <div className="w-full max-w-md bg-white rounded-lg border border-gray-200 overflow-hidden">
            {/* Live current lap row (updates in real time, grayed out to distinguish from recorded laps) */}
            {timerState !== 'idle' && (
              <div className="flex items-center justify-between px-4 py-3 text-gray-400 border-b border-gray-100">
                <span className="w-16 shrink-0 font-medium">Lap {laps.length + 1}</span>
                <span className="flex-1" />
                <span className="font-mono w-20 text-right shrink-0">{formatTime(lapElapsed)}</span>
              </div>
            )}

            {/* Recorded laps (color coded once there are 2+ laps) */}
            {laps.map(lap => (
              <div
                key={lap.lapNumber}
                className={`flex items-center px-4 py-3 gap-4 font-medium border-b border-gray-100 last:border-b-0 ${getLapColorClass(lap)}`}
              >
                <span className="w-16 shrink-0">Lap {lap.lapNumber}</span>
                <span className="font-mono w-20 shrink-0">{formatTime(lap.duration)}</span>
                <textarea
                  placeholder="Add note..."
                  value={lap.notes}
                  onChange={e => updateLapNotes(lap.lapNumber, e.target.value)}
                  rows={1}
                  className="flex-1 text-sm text-gray-600 bg-transparent border-b border-gray-200 focus:outline-none focus:ring-0 focus:border-blue-600 placeholder-gray-300 resize-none overflow-hidden"
                  onInput={e => {
                    // auto-expand the textarea height as the user types more lines
                    const el = e.currentTarget;
                    el.style.height = 'auto';
                    el.style.height = `${el.scrollHeight}px`;
                  }}
                />
              </div>
            ))}
          </div>
        )}

        {/* Pre-test configuration notes (resets with the timer so each run starts fresh)*/}
        <div className="w-full max-w-md mt-10">
          <h2 className="text-2xl font-semibold mb-2">Pre-Test Configs</h2>
          <textarea
            placeholder="e.g. Track: Lot B, Conditions: dry, Driver: Tristan, Recorded by: Ethan, Setup: <car specs>, Testing: new brakes, absent shifting..."
            value={preTestConfigs}
            onChange={e => setPreTestConfigs(e.target.value)}
            rows={3}
            className="w-full text-sm text-gray-600 bg-transparent border border-gray-200 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent placeholder-gray-300 resize-none"
            onInput={e => {
              const el = e.currentTarget;
              el.style.height = 'auto';
              el.style.height = `${el.scrollHeight}px`;
            }}
          />
        </div>
      </div>
    </PageBase>
  );
};

export default TimerPage;

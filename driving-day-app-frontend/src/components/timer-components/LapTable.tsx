// LapTable.tsx
// Renders the lap list for a timer session.
// Used in both the live timer (Part 1) and the past runs viewer (Part 2).
// When used in the live timer, lapElapsed and timerState are passed in to show the live current lap row.
// When used in the past runs viewer, those props are omitted and only recorded laps are shown.

import React from 'react';
import { formatTime } from '../../utils/formatTime';

type TimerState = 'idle' | 'running' | 'stopped';

interface Lap {
  lapNumber: number;
  duration: number; // lap time in milliseconds
  notes: string;
}

interface LapTableProps {
  laps: Lap[];
  onUpdateNotes: (lapNumber: number, value: string) => void;
  lapElapsed?: number;     // only passed in live timer — drives the live current lap row
  timerState?: TimerState; // only passed in live timer — controls whether the live row is visible
  className?: string;      // optional width override — defaults to max-w-md for live timer
}


const LapTable: React.FC<LapTableProps> = ({ laps, onUpdateNotes, lapElapsed = 0, timerState = 'idle', className = 'max-w-md' }) => {
  // Only highlight best/worst laps once there are 2+ recorded laps
  const minDuration = laps.length >= 2 ? Math.min(...laps.map(l => l.duration)) : null;
  const maxDuration = laps.length >= 2 ? Math.max(...laps.map(l => l.duration)) : null;

  // Returns a Tailwind text color: green for fastest, red for slowest, gray otherwise
  const getLapColorClass = (lap: Lap): string => {
    if (laps.length < 2) return 'text-gray-800';
    if (lap.duration === minDuration) return 'text-green-600';
    if (lap.duration === maxDuration) return 'text-red-500';
    return 'text-gray-800';
  };

  // Don't render anything if there are no laps and the timer hasn't started
  if (laps.length === 0 && timerState === 'idle') return null;

  return (
    <div className={`w-full ${className} bg-white rounded-lg border border-gray-200 overflow-hidden`}>
      {/* Live current lap row — only shown during an active session */}
      {timerState !== 'idle' && (
        <div className="flex items-center justify-between px-4 py-3 text-gray-400 border-b border-gray-100">
          <span className="w-16 shrink-0 font-medium">Lap {laps.length + 1}</span>
          <span className="flex-1" />
          <span className="font-mono w-20 text-right shrink-0">{formatTime(lapElapsed)}</span>
        </div>
      )}

      {/* Recorded laps — color coded once there are 2+ laps */}
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
            onChange={e => onUpdateNotes(lap.lapNumber, e.target.value)}
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
  );
};

export default LapTable;

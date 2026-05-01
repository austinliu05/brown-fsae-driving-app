// PastRunsSection.tsx
// Renders the Past Runs accordion below the live timer.
// Manages its own state — self-contained, no props needed.

import React, { useState } from 'react';
import LapTable from './LapTable';
import PreTestConfigs from './PreTestConfigs';

interface Lap {
  lapNumber: number;
  duration: number;
  notes: string;
}

interface PastRun {
  id: string;
  date: string;           // MM/DD/YYYY — used for grouping and filtering
  runName: string;        // e.g. "AutoX_1"
  preTestConfigs: string;
  laps: Lap[];
}


const PastRunsSection: React.FC = () => {
  const [pastRuns, setPastRuns] = useState<PastRun[]>([]);  // empty until backend is up
  /* const [pastRuns, setPastRuns] = useState<PastRun[]>([
    {
      id: '1',
      date: '04/21/2026',
      runName: 'AutoX_1',
      preTestConfigs: 'Track: Lot B, Conditions: dry, Driver: Tristan',
      laps: [
        { lapNumber: 1, duration: 62340, notes: '' },
        { lapNumber: 2, duration: 61200, notes: 'understeer on turn 3' },
        { lapNumber: 3, duration: 63100, notes: '' },
      ],
    },
    {
      id: '2',
      date: '04/21/2026',
      runName: 'AutoX_2',
      preTestConfigs: 'Track: Lot B, Conditions: dry, Driver: Tristan',
      laps: [
        { lapNumber: 1, duration: 60800, notes: '' },
        { lapNumber: 2, duration: 61500, notes: '' },
      ],
    },
  ]); */
  const [selectedDate, setSelectedDate] = useState<string>('All');

  // Updates the pre-test configs text for a specific past run
  const updatePastRunConfigs = (runId: string, value: string) => {
    setPastRuns(prev =>
      prev.map(run => run.id === runId ? { ...run, preTestConfigs: value } : run)
    );
  };

  // Updates the notes for a specific lap within a specific past run
  const updatePastRunLapNotes = (runId: string, lapNumber: number, value: string) => {
    setPastRuns(prev =>
      prev.map(run =>
        run.id === runId
          ? { ...run, laps: run.laps.map(lap => lap.lapNumber === lapNumber ? { ...lap, notes: value } : lap) }
          : run
      )
    );
  };

  // Unique dates from past runs for the filter dropdown
  const uniqueDates = Array.from(new Set(pastRuns.map(r => r.date)));

  // Runs to display — all runs, or only those matching the selected date
  const filteredRuns = selectedDate === 'All'
    ? pastRuns
    : pastRuns.filter(r => r.date === selectedDate);

  return (
    <div className="mt-10">
      <h2 className="text-2xl font-semibold mb-1">Past Runs</h2>

      {/* Date filter dropdown */}
      <select
        value={selectedDate}
        onChange={e => setSelectedDate(e.target.value)}
        className="px-4 py-2 border border-gray-200 rounded-md bg-white mb-4 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
      >
        <option value="All">All Dates</option>
        {uniqueDates.map(date => (
          <option key={date} value={date}>{date}</option>
        ))}
      </select>

      {/* Empty state — shown when there are no runs matching the filter */}
      {filteredRuns.length === 0 && (
        <div className="text-gray-500 italic">No past runs to display.</div>
      )}

      {/* Accordion — one collapsible row per run */}
      {filteredRuns.map(run => (
        <details key={run.id} className="mb-2 p-3 border rounded">
          <summary className="flex items-center justify-between font-semibold cursor-pointer">
            <span>{run.runName}</span>
            <span className="text-sm text-gray-500">{run.date}</span>
          </summary>
          <div className="mt-4">
            <PreTestConfigs
              value={run.preTestConfigs}
              onChange={v => updatePastRunConfigs(run.id, v)}
              className="w-full"
            />
            <div className="mt-4">
              <LapTable
                laps={run.laps}
                onUpdateNotes={(lapNumber, value) => updatePastRunLapNotes(run.id, lapNumber, value)}
                className="w-full"
              />
            </div>
          </div>
        </details>
      ))}
    </div>
  );
};

export default PastRunsSection;

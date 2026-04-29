// formatTime.ts
// Shared utility for converting milliseconds into MM:SS.cs display format.
// Used by the lap timer page and any component that displays lap or session times.

// cs = centiseconds (hundredths of a second) — matches how the iPhone stopwatch displays time
export function formatTime(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const centiseconds = Math.floor((ms % 1000) / 10);
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(centiseconds).padStart(2, '0')}`;
}

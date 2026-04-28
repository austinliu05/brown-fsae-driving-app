// PreTestConfigs.tsx
// Renders the pre-test configuration notes textarea.
// Used in both the live timer (Part 1) and the past runs viewer (Part 2).

import React from 'react';

interface PreTestConfigsProps {
  value: string;
  onChange: (value: string) => void;
}

const PreTestConfigs: React.FC<PreTestConfigsProps> = ({ value, onChange }) => {
  return (
    <div className="w-full max-w-md mt-10">
      <h2 className="text-2xl font-semibold mb-1">Pre-Test Configs</h2>
      <p className="text-xs text-gray-400 mb-2">e.g. Track: Lot B, Conditions: dry, Driver: Tristan, Recorded by: Ethan, Setup: &lt;car specs&gt;, Testing: new brakes, absent shifting...</p>
      <textarea
        placeholder="Notes..."
        value={value}
        onChange={e => onChange(e.target.value)}
        rows={3}
        className="w-full text-sm text-gray-600 bg-transparent border border-gray-200 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent placeholder-gray-300 resize-none"
        onInput={e => {
          // auto-expand the textarea height as the user types more lines
          const el = e.currentTarget;
          el.style.height = 'auto';
          el.style.height = `${el.scrollHeight}px`;
        }}
      />
    </div>
  );
};

export default PreTestConfigs;

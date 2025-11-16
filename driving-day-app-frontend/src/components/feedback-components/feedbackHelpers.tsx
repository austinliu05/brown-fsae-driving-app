import React from 'react';
import { ResponseValue } from '../../utils/DataTypes';

export type QType = 'yesOther' | 'noOther' | 'text' | 'multi';

export interface Question {
  key: string;
  label: string;
  type: QType;
  options?: string[];
  placeholder?: string;
}

export const normalizeDateInput = (date: any): string => {
  if (!date) return '';
  if (typeof date === 'string') return date.split('T')[0];
  // Build local YYYY-MM-DD to avoid timezone shifts when serializing
  try {
    const d = new Date(date);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  } catch {
    return '';
  }
}

// Convert a YYYY-MM-DD (local date) to an ISO string at local midnight, avoiding timezone off-by-one
export const toISODate = (yyyyMMdd: string): string => {
  if (!yyyyMMdd) return '';
  const parts = yyyyMMdd.split('-');
  if (parts.length !== 3) return '';
  const y = Number(parts[0]);
  const m = Number(parts[1]) - 1; // monthIndex
  const d = Number(parts[2]);
  const dt = new Date(y, m, d, 0, 0, 0, 0);
  return dt.toISOString();
}

export const parseMulti = (value?: string): string[] => {
  return (value || '').toString().split('|').filter(Boolean);
}

export const toggleMulti = (value: string | undefined, option: string): string => {
  const arr = parseMulti(value);
  if (option === 'Other') {
    const otherIdx = arr.findIndex((t: string) => t.startsWith('Other::'));
    if (otherIdx >= 0) arr.splice(otherIdx, 1);
    else {
      // removing any 'n/a' sentinel when user adds Other
      const naIdx = arr.indexOf('n/a'); if (naIdx >= 0) arr.splice(naIdx, 1);
      arr.push('Other::');
    }
  } else {
    const idx = arr.indexOf(option);
    if (idx >= 0) arr.splice(idx, 1);
    else arr.push(option);
  }
  // If the user selected a real option, remove any existing 'n/a' sentinel
  const naIdx2 = arr.indexOf('n/a');
  if (naIdx2 >= 0 && arr.length > 1) arr.splice(naIdx2, 1);

  // If nothing is selected, return 'n/a' to preserve default semantics
  if (arr.length === 0) return 'n/a';
  return arr.join('|');
}

export const formatMultiDisplay = (value?: string): string => {
  const tokens = parseMulti(value);
  // filter out 'n/a' sentinel unless it's the only token
  const filtered = tokens.filter((t: string) => t !== 'n/a');
  if (filtered.length === 0) return 'N/A';
  return filtered.map((t: string) => t.startsWith('Other::') ? `Other: ${t.split('::')[1]}` : t).join(', ');
}

interface QuestionFieldProps {
  q: Question;
  value?: string;
  onChange: (v: ResponseValue) => void;
  onMultiToggle?: (opt: string) => void;
  isLoading?: boolean;
}

export const QuestionField: React.FC<QuestionFieldProps> = ({ q, value = '', onChange, onMultiToggle, isLoading }) => {
  return (
    <div className="p-3 border rounded">
      <div className="mb-2 text-sm font-medium">{q.label}</div>
      <div>
        {q.type === 'text' && (
          <textarea
            className="w-full border rounded p-2"
            placeholder={q.placeholder}
            value={value === 'n/a' ? '' : value}
            onChange={(e) => onChange(e.target.value as ResponseValue)}
            disabled={isLoading}
          />
        )}

        {q.type === 'yesOther' && (
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2">
              <input type="radio" name={q.key} checked={value === 'yes'} onChange={() => onChange('yes')} disabled={isLoading} />
              <span>Yes</span>
            </label>

            <label className="flex items-center gap-2">
              <input type="radio" name={q.key} checked={value !== 'yes' && value !== 'n/a'} onChange={() => onChange('')} disabled={isLoading} />
              <span>Other</span>
            </label>

            {(value !== 'yes' && value !== 'n/a') && (
              <input className="border p-1 rounded w-full" placeholder={q.placeholder} value={value === 'n/a' ? '' : value} onChange={(e) => onChange(e.target.value as ResponseValue)} disabled={isLoading} />
            )}
          </div>
        )}

        {q.type === 'noOther' && (
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2">
              <input type="radio" name={q.key} checked={value === 'no'} onChange={() => onChange('no')} disabled={isLoading} />
              <span>No</span>
            </label>

            <label className="flex items-center gap-2">
              <input type="radio" name={q.key} checked={value !== 'no' && value !== 'n/a'} onChange={() => onChange('')} disabled={isLoading} />
              <span>Other</span>
            </label>

            {(value !== 'no' && value !== 'n/a') && (
              <input className="border p-1 rounded w-full" placeholder={q.placeholder} value={value === 'n/a' ? '' : value} onChange={(e) => onChange(e.target.value as ResponseValue)} disabled={isLoading} />
            )}
          </div>
        )}

        {q.type === 'multi' && (
          <div className="flex flex-col gap-2">
            {(() => {
              const tokens = parseMulti(value);
              const otherToken = tokens.find((t: string) => t.startsWith('Other::'));
              return (
                <>
                  {q.options?.map(opt => {
                    const checked = opt === 'Other' ? !!otherToken : tokens.includes(opt);
                    return (
                      <label key={opt} className="flex items-center gap-2">
                        <input type="checkbox" checked={checked} onChange={() => onMultiToggle && onMultiToggle(opt)} disabled={isLoading} />
                        <span>{opt}</span>
                      </label>
                    )
                  })}

                  {otherToken && (
                    <input className="border p-1 rounded w-full" placeholder={q.placeholder} value={otherToken.split('::')[1] || ''} onChange={(e) => {
                      const newVal = e.target.value;
                      const newTokens = tokens.filter((t: string) => !t.startsWith('Other::'));
                      newTokens.push(`Other::${newVal}`);
                      onChange(newTokens.join('|') as ResponseValue);
                    }} disabled={isLoading} />
                  )}
                </>
              )
            })()}
          </div>
        )}
      </div>
    </div>
  )
}

export default {};

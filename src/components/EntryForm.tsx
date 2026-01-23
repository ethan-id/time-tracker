import { useEffect, useMemo, useState } from 'react';
import { EntryInput } from '@/types';
import { TimeInput } from './TimeInput';

type EntryFormProps = {
    onSubmit: (entry: EntryInput) => void;
};

const ENGAGEMENT_HISTORY_KEY = 'time-tracker.engagementHistory.v1';
const MAX_ENGAGEMENT_HISTORY = 50;

function cleanEngagementValue(value: unknown): string | null {
    if (typeof value !== 'string') return null;
    const v = value.trim();
    if (!v || v.length > 100) return null;
    return v;
}

export function EntryForm({ onSubmit }: EntryFormProps) {
    const [engagement, setEngagement] = useState('');
    const [engagementHistory, setEngagementHistory] = useState<string[]>([]);
    const [isEngagementMenuOpen, setIsEngagementMenuOpen] = useState(false);
    const [activeEngagementIndex, setActiveEngagementIndex] = useState(-1);
    const [category, setCategory] = useState('');
    const [start, setStart] = useState('');
    const [end, setEnd] = useState('');
    const isPmToAm = (() => {
        if (!start || !end) return false;
        const startHour = parseInt(start.split(':')[0], 10);
        const endHour = parseInt(end.split(':')[0], 10);
        if (isNaN(startHour) || isNaN(endHour)) return false;
        return startHour >= 12 && endHour < 12;
    })();

    useEffect(() => {
        try {
            const raw = localStorage.getItem(ENGAGEMENT_HISTORY_KEY);
            if (!raw) return;
            const parsed = JSON.parse(raw);
            if (!Array.isArray(parsed)) return;

            const next: string[] = [];
            const seen = new Set<string>();
            for (const item of parsed) {
                const cleaned = cleanEngagementValue(item);
                if (!cleaned) continue;
                const key = cleaned.toLowerCase();
                if (seen.has(key)) continue;
                seen.add(key);
                next.push(cleaned);
                if (next.length >= MAX_ENGAGEMENT_HISTORY) break;
            }
            setEngagementHistory(next);
        } catch {
            // Ignore malformed localStorage
        }
    }, []);

    function persistEngagementHistory(next: string[]) {
        try {
            localStorage.setItem(ENGAGEMENT_HISTORY_KEY, JSON.stringify(next));
        } catch {
            // Ignore storage failures (private mode, quota, etc.)
        }
    }

    function saveEngagementToHistory(value: string) {
        const cleaned = cleanEngagementValue(value);
        if (!cleaned) return;

        setEngagementHistory((prev) => {
            const key = cleaned.toLowerCase();
            const next = [cleaned, ...prev.filter((v) => v.toLowerCase() !== key)].slice(0, MAX_ENGAGEMENT_HISTORY);
            persistEngagementHistory(next);
            return next;
        });
    }

    function removeEngagementFromHistory(value: string) {
        const cleaned = cleanEngagementValue(value);
        if (!cleaned) return;
        setEngagementHistory((prev) => {
            const key = cleaned.toLowerCase();
            const next = prev.filter((v) => v.toLowerCase() !== key);
            persistEngagementHistory(next);
            return next;
        });
    }

    const filteredEngagementHistory = useMemo(() => {
        const q = engagement.trim().toLowerCase();
        const base = q ? engagementHistory.filter((v) => v.toLowerCase().includes(q)) : engagementHistory;
        return base.slice(0, 8);
    }, [engagement, engagementHistory]);

    useEffect(() => {
        if (!isEngagementMenuOpen) return;
        if (filteredEngagementHistory.length === 0) {
            setActiveEngagementIndex(-1);
            return;
        }
        setActiveEngagementIndex((i) => {
            if (i < 0) return -1;
            return Math.min(i, filteredEngagementHistory.length - 1);
        });
    }, [filteredEngagementHistory, isEngagementMenuOpen]);

    function selectEngagementSuggestion(value: string) {
        setEngagement(value);
        setIsEngagementMenuOpen(false);
        setActiveEngagementIndex(-1);
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (isPmToAm) return;
        saveEngagementToHistory(engagement);
        onSubmit({ engagement, category, start, end });
        
        // Move end time to start time for next entry
        setStart(end);
        setEnd('');
    }

    function handleClearForm() {
        setEngagement('');
        setCategory('');
        setStart('');
        setEnd('');
    }

    return (
        <section className='bg-white rounded-xl shadow-sm p-5 sm:p-6'>
            <h2 className='text-lg font-semibold text-neutral-900 mb-4'>Add Entry</h2>
            <form onSubmit={handleSubmit} className='space-y-4'>
                <div className='grid grid-cols-1 gap-4'>
                    <label className='flex flex-col gap-1.5'>
                        <span className='text-sm font-medium text-neutral-700'>Engagement</span>
                        <div className='relative'>
                            <input
                                className='w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                                value={engagement}
                                onChange={(e) => {
                                    setEngagement(e.target.value);
                                    setIsEngagementMenuOpen(true);
                                    setActiveEngagementIndex(-1);
                                }}
                                onFocus={() => setIsEngagementMenuOpen(true)}
                                onBlur={() => {
                                    // Let clicks inside the menu (mousedown) run first
                                    window.setTimeout(() => setIsEngagementMenuOpen(false), 0);
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Escape') {
                                        setIsEngagementMenuOpen(false);
                                        setActiveEngagementIndex(-1);
                                        return;
                                    }

                                    if (e.key === 'ArrowDown') {
                                        e.preventDefault();
                                        setIsEngagementMenuOpen(true);
                                        setActiveEngagementIndex((i) => {
                                            const max = filteredEngagementHistory.length - 1;
                                            if (max < 0) return -1;
                                            return Math.min(i + 1, max);
                                        });
                                        return;
                                    }

                                    if (e.key === 'ArrowUp') {
                                        e.preventDefault();
                                        setIsEngagementMenuOpen(true);
                                        setActiveEngagementIndex((i) => Math.max(i - 1, -1));
                                        return;
                                    }

                                    if (e.key === 'Enter' && isEngagementMenuOpen && activeEngagementIndex >= 0) {
                                        const v = filteredEngagementHistory[activeEngagementIndex];
                                        if (v) {
                                            e.preventDefault(); // don't submit the form when selecting a suggestion
                                            selectEngagementSuggestion(v);
                                        }
                                    }
                                }}
                                placeholder='Project name'
                                autoComplete='off'
                                aria-label='Engagement'
                                aria-expanded={isEngagementMenuOpen && filteredEngagementHistory.length > 0}
                                aria-controls='engagement-suggestions'
                                aria-activedescendant={
                                    activeEngagementIndex >= 0 ? `engagement-suggestion-${activeEngagementIndex}` : undefined
                                }
                            />

                            {isEngagementMenuOpen && filteredEngagementHistory.length > 0 && (
                                <ul
                                    id='engagement-suggestions'
                                    role='listbox'
                                    className='absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-lg'
                                >
                                    {filteredEngagementHistory.map((v, idx) => {
                                        const isActive = idx === activeEngagementIndex;
                                        return (
                                            <li
                                                key={v}
                                                id={`engagement-suggestion-${idx}`}
                                                role='option'
                                                aria-selected={isActive}
                                                className={`flex items-center justify-between gap-2 px-2 py-1.5 text-sm ${
                                                    isActive ? 'bg-blue-50' : 'bg-white'
                                                }`}
                                                onMouseEnter={() => setActiveEngagementIndex(idx)}
                                            >
                                                <button
                                                    type='button'
                                                    className='flex-1 text-left text-neutral-800 truncate px-1 py-1 hover:text-neutral-900'
                                                    onMouseDown={(e) => e.preventDefault()}
                                                    onClick={() => selectEngagementSuggestion(v)}
                                                    title={v}
                                                >
                                                    {v}
                                                </button>
                                                <button
                                                    type='button'
                                                    className='shrink-0 rounded-md px-2 py-1 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800'
                                                    onMouseDown={(e) => e.preventDefault()}
                                                    onClick={() => removeEngagementFromHistory(v)}
                                                    aria-label={`Remove ${v} from saved engagements`}
                                                    title='Remove'
                                                >
                                                    ×
                                                </button>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </div>
                    </label>
                    <label className='flex flex-col gap-1.5'>
                        <span className='text-sm font-medium text-neutral-700'>Category</span>
                        <input 
                            className='border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent' 
                            value={category} 
                            onChange={(e) => setCategory(e.target.value)} 
                            placeholder='Activity type'
                        />
                    </label>
                    <TimeInput
                        label='Start Time'
                        value={start}
                        onChange={setStart}
                    />
                    <TimeInput
                        label='End Time'
                        value={end}
                        onChange={setEnd}
                    />
                </div>
                <div className='flex gap-3 pt-2'>
                    <button 
                        type='submit' 
                        disabled={isPmToAm}
                        className='bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                        Add Entry
                    </button>
                    <button 
                        type='button' 
                        className='bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-medium px-5 py-2.5 rounded-lg text-sm transition-colors' 
                        onClick={handleClearForm}
                    >
                        Clear Form
                    </button>
                </div>
            </form>
        </section>
    );
}

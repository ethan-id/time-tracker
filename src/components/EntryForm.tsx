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

    const engagementSuggestion = useMemo(() => {
        const typed = engagement;
        if (!typed) return null;
        // Keep it simple + predictable: only suggest when the input is already trimmed.
        if (typed !== typed.trim()) return null;
        const q = typed.toLowerCase();
        if (!q) return null;
        const found = engagementHistory.find((v) => v.toLowerCase().startsWith(q) && v.length > typed.length);
        return found ?? null;
    }, [engagement, engagementHistory]);

    const engagementSuggestionRemainder = useMemo(() => {
        if (!engagementSuggestion) return '';
        if (engagementSuggestion.length <= engagement.length) return '';
        return engagementSuggestion.slice(engagement.length);
    }, [engagement, engagementSuggestion]);

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
                            <div className='relative w-full rounded-lg border border-neutral-300 bg-white focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent'>
                                {engagementSuggestionRemainder && (
                                    <div
                                        className='pointer-events-none absolute inset-0 z-0 px-3 py-2 text-sm whitespace-pre overflow-hidden'
                                        aria-hidden='true'
                                    >
                                        <span className='text-transparent'>{engagement}</span>
                                        <span className='text-neutral-400'>{engagementSuggestionRemainder}</span>
                                    </div>
                                )}
                                <input
                                    className='relative z-10 w-full bg-transparent px-3 py-2 text-sm focus:outline-none'
                                    value={engagement}
                                    onChange={(e) => setEngagement(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && engagementSuggestion) {
                                            // Accept the suggestion instead of submitting the form.
                                            e.preventDefault();
                                            setEngagement(engagementSuggestion);
                                            return;
                                        }
                                    }}
                                    placeholder='Project name'
                                    autoComplete='off'
                                    aria-label='Engagement'
                                />
                            </div>
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

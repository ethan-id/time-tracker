"use client";

import { useMemo, useReducer, useState } from 'react';
import { initialState, reducer } from '@/state';
import { EntryInput, Report } from '@/types';
import { buildReport } from '@/lib/report';
import { formatHM } from '@/lib/time';

export default function Home() {
    const [state, dispatch] = useReducer(reducer, initialState);

    // Form state (uncontrolled keeps value after submit per spec optional UX)
    const [engagement, setEngagement] = useState('');
    const [category, setCategory] = useState('');
    const [start, setStart] = useState('');
    const [end, setEnd] = useState('');

    const timezone = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone, []);
    const report: Report = useMemo(() => buildReport(state.entries, timezone, state.notes), [state.entries, timezone, state.notes]);

    // Local edit buffer for notes keyed by `${engagement}|||${category}`
    const [localNotes, setLocalNotes] = useState<Record<string, string>>({});

    function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        const payload: EntryInput = { engagement, category, start, end };
        dispatch({ type: 'ADD', payload });
    }

    function onClear() {
        dispatch({ type: 'CLEAR' });
    }

    function saveNote(eng: string, cat: string, note: string) {
        dispatch({ type: 'SET_NOTE', payload: { engagement: eng, category: cat, note } });
    }

    function formatLocalHM(iso: string): string {
        return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    return (
        <div className='min-h-screen bg-neutral-50'>
            <div className='mx-auto max-w-4xl px-4 py-6 sm:py-8 space-y-6'>
                {/* Header */}
                <header className='text-center sm:text-left'>
                    <h1 className='text-3xl sm:text-4xl font-bold text-neutral-900'>Time Tracker</h1>
                    <p className='text-sm text-neutral-500 mt-1'>Track your time and calculate OIT per engagement</p>
                </header>

                {/* Error Alert */}
                {state.error && (
                    <div role='alert' className='bg-red-50 border-l-4 border-red-500 rounded-lg p-4 flex items-start justify-between shadow-sm'>
                        <div className='flex items-start gap-3'>
                            <svg className='w-5 h-5 text-red-500 mt-0.5' fill='currentColor' viewBox='0 0 20 20'>
                                <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z' clipRule='evenodd' />
                            </svg>
                            <span className='text-sm text-red-800'>{state.error}</span>
                        </div>
                        <button 
                            className='text-red-500 hover:text-red-700 text-sm font-medium' 
                            onClick={() => dispatch({ type: 'DISMISS_ERROR' })}
                        >
                            Dismiss
                        </button>
                    </div>
                )}

                {/* Add Entry Form */}
                <section className='bg-white rounded-xl shadow-sm p-5 sm:p-6'>
                    <h2 className='text-lg font-semibold text-neutral-900 mb-4'>Add Entry</h2>
                    <form onSubmit={onSubmit} className='space-y-4'>
                        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                            <label className='flex flex-col gap-1.5'>
                                <span className='text-sm font-medium text-neutral-700'>Engagement</span>
                                <input 
                                    className='border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent' 
                                    value={engagement} 
                                    onChange={(e) => setEngagement(e.target.value)} 
                                    placeholder='Project name'
                                />
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
                            <label className='flex flex-col gap-1.5'>
                                <span className='text-sm font-medium text-neutral-700'>Start Time</span>
                                <input 
                                    type='time' 
                                    className='border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent' 
                                    value={start} 
                                    onChange={(e) => setStart(e.target.value)} 
                                />
                            </label>
                            <label className='flex flex-col gap-1.5'>
                                <span className='text-sm font-medium text-neutral-700'>End Time</span>
                                <input 
                                    type='time' 
                                    className='border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent' 
                                    value={end} 
                                    onChange={(e) => setEnd(e.target.value)} 
                                />
                            </label>
                        </div>
                        <div className='flex gap-3 pt-2'>
                            <button 
                                type='submit' 
                                className='bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-lg text-sm transition-colors'
                            >
                                Add Entry
                            </button>
                            <button 
                                type='button' 
                                className='bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-medium px-5 py-2.5 rounded-lg text-sm transition-colors' 
                                onClick={onClear}
                            >
                                Clear All
                            </button>
                        </div>
                    </form>
                </section>

                {/* Entries Table */}
                {state.entries.length > 0 && (
                    <section className='bg-white rounded-xl shadow-sm p-5 sm:p-6'>
                        <div className='flex items-center justify-between mb-4'>
                            <h2 className='text-lg font-semibold text-neutral-900'>Recent Entries</h2>
                            <span className='text-sm text-neutral-500'>{state.entries.length} total</span>
                        </div>
                        <div className='overflow-x-auto -mx-5 sm:-mx-6'>
                            <div className='inline-block min-w-full align-middle px-5 sm:px-6'>
                                <table className='min-w-full'>
                                    <thead>
                                        <tr className='border-b border-neutral-200'>
                                            <th className='text-left text-xs font-medium text-neutral-500 uppercase tracking-wider pb-3 pr-4'>ID</th>
                                            <th className='text-left text-xs font-medium text-neutral-500 uppercase tracking-wider pb-3 pr-4'>Engagement</th>
                                            <th className='text-left text-xs font-medium text-neutral-500 uppercase tracking-wider pb-3 pr-4'>Category</th>
                                            <th className='text-left text-xs font-medium text-neutral-500 uppercase tracking-wider pb-3 pr-4'>Start</th>
                                            <th className='text-left text-xs font-medium text-neutral-500 uppercase tracking-wider pb-3 pr-4'>End</th>
                                            <th className='text-left text-xs font-medium text-neutral-500 uppercase tracking-wider pb-3 pr-4'>Min</th>
                                            <th className='text-left text-xs font-medium text-neutral-500 uppercase tracking-wider pb-3'>OIT</th>
                                        </tr>
                                    </thead>
                                    <tbody className='divide-y divide-neutral-100'>
                                        {state.entries.map((e) => (
                                            <tr key={e.id} className='hover:bg-neutral-50'>
                                                <td className='py-3 pr-4 text-sm text-neutral-600'>{e.id}</td>
                                                <td className='py-3 pr-4 text-sm text-neutral-900 font-medium'>{e.engagement}</td>
                                                <td className='py-3 pr-4 text-sm text-neutral-600'>{e.category}</td>
                                                <td className='py-3 pr-4 text-sm text-neutral-600 font-mono'>{formatLocalHM(e.startISO)}</td>
                                                <td className='py-3 pr-4 text-sm text-neutral-600 font-mono'>{formatLocalHM(e.endISO)}</td>
                                                <td className='py-3 pr-4 text-sm text-neutral-600'>{e.minutes}</td>
                                                <td className='py-3 text-sm text-neutral-900 font-semibold'>{e.oit.toFixed(1)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </section>
                )}

                {/* Report Section */}
                {report.engagements.length > 0 && (
                    <section className='bg-white rounded-xl shadow-sm p-5 sm:p-6'>
                        <h2 className='text-lg font-semibold text-neutral-900 mb-5'>Report</h2>
                        
                        <div className='space-y-8'>
                            {report.engagements.map((eng) => (
                                <div key={eng.engagement}>
                                    {/* Engagement Header */}
                                    <div className='flex items-start justify-between gap-4 mb-4'>
                                        <div>
                                            <h3 className='text-xl font-bold text-neutral-900'>{eng.engagement}</h3>
                                            <p className='text-sm text-neutral-500 mt-0.5'>
                                                {eng.totals.entries} {eng.totals.entries === 1 ? 'entry' : 'entries'} · {formatHM(eng.totals.minutes)}
                                            </p>
                                        </div>
                                        <div className='text-right'>
                                            <div className='text-xs font-medium text-neutral-500 uppercase tracking-wide'>Total OIT</div>
                                            <div className='text-3xl font-bold text-blue-600 mt-1'>{eng.totals.oit.toFixed(1)}</div>
                                        </div>
                                    </div>

                                    {/* Categories */}
                                    <div className='space-y-3'>
                                        {eng.categories.map((cat) => {
                                            const key = `${eng.engagement}|||${cat.category}`;
                                            const committed = state.notes[key] ?? '';
                                            const draft = localNotes[key] ?? committed;
                                            return (
                                                <div key={cat.category} className='bg-neutral-50 rounded-lg p-4'>
                                                    <div className='flex items-start justify-between gap-4'>
                                                        <div className='flex-1'>
                                                            <h4 className='text-base font-semibold text-neutral-900'>{cat.category}</h4>
                                                            <div className='flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-neutral-600'>
                                                                <span>{cat.entries} {cat.entries === 1 ? 'entry' : 'entries'}</span>
                                                                <span>·</span>
                                                                <span>{cat.totalMinutes} min</span>
                                                                <span>·</span>
                                                                <span>{formatHM(cat.totalMinutes)}</span>
                                                            </div>
                                                        </div>
                                                        <div className='text-right'>
                                                            <div className='text-2xl font-bold text-neutral-900'>{cat.totalOIT.toFixed(1)}</div>
                                                            <div className='text-xs text-neutral-500 mt-0.5'>OIT</div>
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Notes Section */}
                                                    <details className='mt-3 group'>
                                                        <summary className='cursor-pointer select-none text-sm font-medium text-neutral-700 hover:text-neutral-900 flex items-center gap-2'>
                                                            <svg className='w-4 h-4 transition-transform group-open:rotate-90' fill='currentColor' viewBox='0 0 20 20'>
                                                                <path fillRule='evenodd' d='M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z' clipRule='evenodd' />
                                                            </svg>
                                                            {committed ? 'Edit Note' : 'Add Note'}
                                                        </summary>
                                                        <div className='mt-3 space-y-2'>
                                                            <textarea
                                                                className='w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none'
                                                                rows={3}
                                                                value={draft}
                                                                maxLength={1000}
                                                                onChange={(e) => setLocalNotes((prev) => ({ ...prev, [key]: e.target.value }))}
                                                                onBlur={() => saveNote(eng.engagement, cat.category, draft)}
                                                                placeholder='Add a note...'
                                                            />
                                                            <div className='flex justify-between items-center text-xs text-neutral-500'>
                                                                <span>{committed && 'Saved'}</span>
                                                                <span>{draft.length} / 1000</span>
                                                            </div>
                                                        </div>
                                                    </details>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Overall Totals */}
                        <div className='mt-8 pt-6 border-t border-neutral-200'>
                            <div className='flex items-start justify-between gap-4'>
                                <div>
                                    <h3 className='text-xl font-bold text-neutral-900'>Overall Totals</h3>
                                    <p className='text-sm text-neutral-500 mt-0.5'>
                                        {report.overall.entries} {report.overall.entries === 1 ? 'entry' : 'entries'} · {formatHM(report.overall.minutes)} · {report.overall.minutes} minutes
                                    </p>
                                </div>
                                <div className='text-right'>
                                    <div className='text-xs font-medium text-neutral-500 uppercase tracking-wide'>Total OIT</div>
                                    <div className='text-4xl font-bold text-blue-600 mt-1'>{report.overall.oit.toFixed(1)}</div>
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {/* Empty State */}
                {state.entries.length === 0 && (
                    <div className='bg-white rounded-xl shadow-sm p-12 text-center'>
                        <svg className='w-16 h-16 mx-auto text-neutral-300' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
                        </svg>
                        <h3 className='text-lg font-semibold text-neutral-900 mt-4'>No entries yet</h3>
                        <p className='text-sm text-neutral-500 mt-1'>Add your first time entry to get started</p>
                    </div>
                )}
            </div>
        </div>
    );
}
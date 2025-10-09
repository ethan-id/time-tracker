import { useState } from 'react';
import { Report, NotesMap } from '@/types';
import { formatHM } from '@/lib/time';

type ReportSectionProps = {
    report: Report;
    notes: NotesMap;
    localNotes: Record<string, string>;
    onLocalNoteChange: (key: string, value: string) => void;
    onSaveNote: (engagement: string, category: string, note: string) => void;
};

export function ReportSection({ report, notes, localNotes, onLocalNoteChange, onSaveNote }: ReportSectionProps) {
    if (report.engagements.length === 0) return null;

    return (
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
                                const committed = notes[key] ?? '';
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
                                                    onChange={(e) => onLocalNoteChange(key, e.target.value)}
                                                    onBlur={() => onSaveNote(eng.engagement, cat.category, draft)}
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
    );
}

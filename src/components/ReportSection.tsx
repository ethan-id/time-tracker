import { useState } from 'react';
import { Report, NotesMap } from '@/types';
import { formatHM } from '@/lib/time';

type ReportSectionProps = {
    report: Report;
    notes: NotesMap;
    localNotes: Record<string, string>;
    onLocalNoteChange: (key: string, value: string) => void;
    onSaveNote: (entryId: number, note: string) => void;
    formatLocalHM: (iso: string) => string;
};

export function ReportSection({ report, notes, localNotes, onLocalNoteChange, onSaveNote, formatLocalHM }: ReportSectionProps) {
    if (report.engagements.length === 0) return null;

    return (
        <section className='bg-white rounded-xl shadow-sm p-5 sm:p-6'>
            <h2 className='text-lg font-semibold text-neutral-900 mb-5'>Report</h2>
            
            {/* Overall Totals */}
            <div className='mb-8 pb-6 border-b border-neutral-200'>
                <div className='flex items-start justify-between gap-4'>
                    <div>
                        <h3 className='text-xl font-bold text-neutral-900'>Overall Totals</h3>
                        <p className='text-sm text-neutral-500 mt-0.5'>
                            {report.overall.entries} {report.overall.entries === 1 ? 'entry' : 'entries'} · {formatHM(report.overall.minutes)} · {report.overall.minutes} minutes
                        </p>
                    </div>
                    <div className='text-right'>
                        <div className='text-xs font-medium text-neutral-500 uppercase tracking-wide'>Total Hours</div>
                        <div className='text-4xl font-bold text-blue-600 mt-1'>{report.overall.oit.toFixed(1)}</div>
                    </div>
                </div>
            </div>
            
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
                                <div className='text-xs font-medium text-neutral-500 uppercase tracking-wide'>Total Hours</div>
                                <div className='text-3xl font-bold text-blue-600 mt-1'>{eng.totals.oit.toFixed(1)}</div>
                            </div>
                        </div>

                        {/* Categories */}
                        <div className='space-y-4'>
                            {eng.categories.map((cat) => (
                                <div key={cat.category} className='bg-neutral-50 rounded-lg p-4'>
                                    {/* Category Header */}
                                    <div className='flex items-start justify-between gap-4 mb-3'>
                                        <div className='flex-1'>
                                            <h4 className='text-base font-semibold text-neutral-900'>{cat.category}</h4>
                                            <div className='flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-neutral-600'>
                                                <span>{cat.entries.length} {cat.entries.length === 1 ? 'entry' : 'entries'}</span>
                                                <span>·</span>
                                                <span>{cat.totalMinutes} min</span>
                                                <span>·</span>
                                                <span>{formatHM(cat.totalMinutes)}</span>
                                            </div>
                                        </div>
                                        <div className='text-right'>
                                            <div className='text-2xl font-bold text-neutral-900'>{cat.totalOIT.toFixed(1)}</div>
                                            <div className='text-xs text-neutral-500 mt-0.5'>Hours</div>
                                        </div>
                                    </div>
                                    
                                    {/* Individual Entries */}
                                    <div className='space-y-2 mt-3'>
                                        {cat.entries.map((entry) => {
                                            const key = String(entry.id);
                                            const committed = notes[key] ?? '';
                                            const draft = localNotes[key] ?? committed;
                                            
                                            return (
                                                <div key={entry.id} className='bg-white rounded-lg p-3 border border-neutral-200'>
                                                    <div className='flex items-center justify-between gap-4'>
                                                        <div className='flex-1'>
                                                            <div className='flex items-center gap-3 text-sm'>
                                                                <span className='font-mono text-neutral-700'>
                                                                    {formatLocalHM(entry.startISO)} - {formatLocalHM(entry.endISO)}
                                                                </span>
                                                                <span className='text-neutral-400'>·</span>
                                                                <span className='text-neutral-600'>{entry.minutes} min</span>
                                                            </div>
                                                        </div>
                                                        <div className='text-right'>
                                                            <div className='text-lg font-bold text-blue-600'>{entry.oit.toFixed(1)}</div>
                                                            <div className='text-xs text-neutral-500'>Hours</div>
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Note for this entry */}
                                                    <details className='mt-2 group'>
                                                        <summary className='cursor-pointer select-none text-xs font-medium text-neutral-600 hover:text-neutral-900 flex items-center gap-2'>
                                                            <svg className='w-3 h-3 transition-transform group-open:rotate-90' fill='currentColor' viewBox='0 0 20 20'>
                                                                <path fillRule='evenodd' d='M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z' clipRule='evenodd' />
                                                            </svg>
                                                            {committed ? 'Edit Note' : 'Add Note'}
                                                        </summary>
                                                        <div className='mt-2 space-y-1'>
                                                            <textarea
                                                                className='w-full border border-neutral-300 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none'
                                                                rows={2}
                                                                value={draft}
                                                                maxLength={1000}
                                                                onChange={(e) => onLocalNoteChange(key, e.target.value)}
                                                                onBlur={() => onSaveNote(entry.id, draft)}
                                                                placeholder='Add a note...'
                                                            />
                                                            <div className='flex justify-between items-center text-[10px] text-neutral-500'>
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
                    </div>
                ))}
            </div>
        </section>
    );
}
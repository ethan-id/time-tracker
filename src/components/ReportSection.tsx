import { useState } from 'react';
import { Report, NotesMap, EntryInput } from '@/types';
import { formatHM, isoToHHMM } from '@/lib/time';
import { TimeInput } from './TimeInput';

type ReportSectionProps = {
    report: Report;
    notes: NotesMap;
    localNotes: Record<string, string>;
    onLocalNoteChange: (key: string, value: string) => void;
    onSaveNote: (entryId: number, note: string) => void;
    onEditEntry: (entryId: number, entry: EntryInput) => void;
    onDeleteEntry: (entryId: number) => void;
    formatLocalHM: (iso: string) => string;
};

export function ReportSection({ report, notes, localNotes, onLocalNoteChange, onSaveNote, onEditEntry, onDeleteEntry, formatLocalHM }: ReportSectionProps) {
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editForm, setEditForm] = useState<EntryInput>({ engagement: '', category: '', start: '', end: '' });

    if (report.engagements.length === 0) return null;

    function startEditing(entryId: number, engagement: string, category: string, startISO: string, endISO: string) {
        setEditingId(entryId);
        setEditForm({
            engagement,
            category,
            start: isoToHHMM(startISO),
            end: isoToHHMM(endISO)
        });
    }

    function cancelEditing() {
        setEditingId(null);
        setEditForm({ engagement: '', category: '', start: '', end: '' });
    }

    function saveEdit(entryId: number) {
        onEditEntry(entryId, editForm);
        setEditingId(null);
        setEditForm({ engagement: '', category: '', start: '', end: '' });
    }

    return (
        <section className='bg-white rounded-xl shadow-sm p-4 sm:p-5'>
            {/* Overall Totals */}
            <div className='mb-4 pb-4 border-b border-neutral-200'>
                <div className='flex items-start justify-between gap-4'>
                    <div>
                        <h3 className='text-base font-semibold text-neutral-900'>Overall Totals</h3>
                        <p className='text-xs text-neutral-500 mt-0.5'>
                            {report.overall.entries} {report.overall.entries === 1 ? 'entry' : 'entries'} · {formatHM(report.overall.minutes)} · {report.overall.minutes} minutes
                        </p>
                    </div>
                    <div className='text-right'>
                        <div className='text-xs font-medium text-neutral-500 uppercase tracking-wide'>Total Hours</div>
                        <div className='text-3xl font-bold text-blue-600 leading-none mt-1'>{report.overall.oit.toFixed(1)}</div>
                    </div>
                </div>
            </div>
            
            <div className='space-y-4'>
                {report.engagements.map((eng) => (
                    <div key={eng.engagementKey} className='rounded-xl border border-neutral-200 overflow-hidden bg-white shadow-sm'>
                        <details className='group' open>
                            <summary className='list-none cursor-pointer select-none'>
                                <div className='flex items-start justify-between gap-4 px-3 sm:px-4 py-3 bg-white hover:bg-neutral-50 transition-colors border-b border-neutral-200'>
                                    <div className='min-w-0'>
                                        <div className='flex items-start gap-2'>
                                            <div className='w-1 self-stretch rounded-full bg-blue-600/70 group-open:bg-blue-600 flex-none' />
                                            <svg className='mt-1 w-4 h-4 text-blue-500/70 transition-transform group-open:rotate-90 flex-none' fill='currentColor' viewBox='0 0 20 20'>
                                                <path fillRule='evenodd' d='M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z' clipRule='evenodd' />
                                            </svg>
                                            <div className='min-w-0'>
                                                <h3 className='text-lg sm:text-xl font-semibold text-neutral-900 leading-snug truncate'>
                                                    {eng.engagement}
                                                </h3>
                                                <div className='mt-1 flex flex-wrap items-center gap-1.5'>
                                                    <span className='inline-flex items-center rounded-full bg-white/70 border border-blue-200 text-blue-800 px-2 py-0.5 text-[11px] font-medium'>
                                                        {eng.totals.entries} {eng.totals.entries === 1 ? 'entry' : 'entries'}
                                                    </span>
                                                    <span className='inline-flex items-center rounded-full bg-white/70 border border-blue-200 text-blue-800 px-2 py-0.5 text-[11px] font-medium'>
                                                        {formatHM(eng.totals.minutes)}
                                                    </span>
                                                    <span className='inline-flex items-center rounded-full bg-white/70 border border-blue-200 text-blue-800 px-2 py-0.5 text-[11px] font-medium'>
                                                        {eng.totals.minutes} min
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className='text-right flex-none'>
                                        <div className='text-[11px] font-semibold text-blue-900/70 uppercase tracking-wide'>Total Hours</div>
                                        <div className='text-3xl sm:text-4xl font-extrabold text-blue-700 leading-none mt-1 tabular-nums'>
                                            {eng.totals.oit.toFixed(1)}
                                        </div>
                                    </div>
                                </div>
                            </summary>

                            {/* Categories */}
                            <div className='space-y-2 px-3 sm:px-4 pb-3 sm:pb-4 pp-4 mt-4'>
                                {eng.categories.map((cat) => (
                                    <div key={cat.categoryKey} className='rounded-lg border border-neutral-200 bg-white'>
                                        {/* Category Header */}
                                        <div className='flex items-start justify-between gap-4 px-3 py-2 border-b border-neutral-100'>
                                            <div className='flex-1'>
                                                <div className='flex flex-wrap items-baseline gap-x-3 gap-y-0.5'>
                                                    <h4 className='text-xs font-semibold text-neutral-800 uppercase tracking-wide'>{cat.category}</h4>
                                                    <div className='text-[11px] text-neutral-500'>
                                                        {cat.entries.length} {cat.entries.length === 1 ? 'entry' : 'entries'} · {formatHM(cat.totalMinutes)}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className='text-right'>
                                                <div className='text-sm font-semibold text-neutral-700 leading-none tabular-nums'>{cat.totalOIT.toFixed(1)}</div>
                                                <div className='text-[10px] text-neutral-400 mt-0.5'>hrs</div>
                                            </div>
                                        </div>
                                        
                                        {/* Individual Entries */}
                                        <div className='space-y-2 p-3'>
                                            {cat.entries.map((entry) => {
                                                const key = String(entry.id);
                                                const committed = notes[key] ?? '';
                                                const draft = localNotes[key] ?? committed;
                                                const isEditing = editingId === entry.id;
                                                
                                                return (
                                                    <div key={entry.id} className='rounded-lg p-2 border border-neutral-200 bg-neutral-50/30'>
                                                        {isEditing ? (
                                                            // Edit Mode
                                                            <div className='space-y-2'>
                                                                <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                                                                    <label className='flex flex-col gap-1'>
                                                                        <span className='text-xs font-medium text-neutral-700'>Engagement</span>
                                                                        <input 
                                                                            className='border border-neutral-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent' 
                                                                            value={editForm.engagement} 
                                                                            onChange={(e) => setEditForm({ ...editForm, engagement: e.target.value })} 
                                                                        />
                                                                    </label>
                                                                    <label className='flex flex-col gap-1'>
                                                                        <span className='text-xs font-medium text-neutral-700'>Category</span>
                                                                        <input 
                                                                            className='border border-neutral-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent' 
                                                                            value={editForm.category} 
                                                                            onChange={(e) => setEditForm({ ...editForm, category: e.target.value })} 
                                                                        />
                                                                    </label>
                                                                    <TimeInput
                                                                        label='Start Time'
                                                                        value={editForm.start}
                                                                        onChange={(value) => setEditForm({ ...editForm, start: value })}
                                                                    />
                                                                    <TimeInput
                                                                        label='End Time'
                                                                        value={editForm.end}
                                                                        onChange={(value) => setEditForm({ ...editForm, end: value })}
                                                                    />
                                                                </div>
                                                                <div className='flex gap-2'>
                                                                    <button 
                                                                        type='button'
                                                                        className='bg-blue-600 hover:bg-blue-700 text-white font-medium px-3 py-1.5 rounded-lg text-xs transition-colors'
                                                                        onClick={() => saveEdit(entry.id)}
                                                                    >
                                                                        Save
                                                                    </button>
                                                                    <button 
                                                                        type='button'
                                                                        className='bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-medium px-3 py-1.5 rounded-lg text-xs transition-colors'
                                                                        onClick={cancelEditing}
                                                                    >
                                                                        Cancel
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            // View Mode
                                                            <>
                                                                <div className='flex items-center justify-between gap-4'>
                                                                    <div className='flex-1'>
                                                                        <div className='flex items-center gap-2 text-sm'>
                                                                            <button
                                                                                type='button'
                                                                                className='text-neutral-400 hover:text-blue-600 transition-colors'
                                                                                onClick={() => startEditing(entry.id, entry.engagement, entry.category, entry.startISO, entry.endISO)}
                                                                                title='Edit entry'
                                                                            >
                                                                                <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                                                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z' />
                                                                                </svg>
                                                                            </button>
                                                                            <span className='font-mono text-neutral-700'>
                                                                                {formatLocalHM(entry.startISO)} - {formatLocalHM(entry.endISO)}
                                                                            </span>
                                                                            <span className='text-neutral-400'>·</span>
                                                                            <span className='text-neutral-600 text-xs'>{entry.minutes} min</span>
                                                                        </div>
                                                                    </div>
                                                                    <div className='text-right'>
                                                                        <div className='text-sm font-semibold text-blue-700 leading-none tabular-nums'>{entry.oit.toFixed(1)}</div>
                                                                        <div className='text-[10px] text-neutral-400'>hrs</div>
                                                                        <button
                                                                            type='button'
                                                                            className='mt-1 text-neutral-400 hover:text-red-600 transition-colors'
                                                                            onClick={() => onDeleteEntry(entry.id)}
                                                                            title='Delete entry'
                                                                        >
                                                                            <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                                                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' />
                                                                            </svg>
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                                
                                                                {/* Note for this entry */}
                                                                <details className='mt-1 group'>
                                                                    <summary className='cursor-pointer select-none text-[11px] font-medium text-neutral-600 hover:text-neutral-900 flex items-center gap-2'>
                                                                        <svg className='w-3 h-3 transition-transform group-open:rotate-90' fill='currentColor' viewBox='0 0 20 20'>
                                                                            <path fillRule='evenodd' d='M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z' clipRule='evenodd' />
                                                                        </svg>
                                                                        {committed ? 'Edit Note' : 'Add Note'}
                                                                    </summary>
                                                                    <div className='mt-1 space-y-1'>
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
                                                            </>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </details>
                    </div>
                ))}
            </div>
        </section>
    );
}
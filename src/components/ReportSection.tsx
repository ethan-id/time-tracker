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
    formatLocalHM: (iso: string) => string;
};

export function ReportSection({ report, notes, localNotes, onLocalNoteChange, onSaveNote, onEditEntry, formatLocalHM }: ReportSectionProps) {
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
                                            const isEditing = editingId === entry.id;
                                            
                                            return (
                                                <div key={entry.id} className='bg-white rounded-lg p-3 border border-neutral-200'>
                                                    {isEditing ? (
                                                        // Edit Mode
                                                        <div className='space-y-3'>
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
                                                        </>
                                                    )}
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
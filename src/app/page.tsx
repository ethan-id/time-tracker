"use client";

import { useMemo, useReducer, useState, useEffect } from 'react';
import { initialState, reducer } from '@/state';
import { EntryInput, Report } from '@/types';
import { buildReport } from '@/lib/report';
import { ErrorAlert } from '@/components/ErrorAlert';
import { EntryForm } from '@/components/EntryForm';
import { ReportSection } from '@/components/ReportSection';
import { EmptyState } from '@/components/EmptyState';
import { SuccessNotification } from '@/components/SuccessNotification';

export default function Home() {
    const [state, dispatch] = useReducer(reducer, initialState);
    const [localNotes, setLocalNotes] = useState<Record<string, string>>({});
    const [showSuccess, setShowSuccess] = useState(false);
    const [prevEntryCount, setPrevEntryCount] = useState(0);

    const timezone = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone, []);
    const report: Report = useMemo(() => buildReport(state.entries, timezone, state.notes), [state.entries, timezone, state.notes]);

    // Show success notification when entry count increases
    useEffect(() => {
        if (state.entries.length > prevEntryCount) {
            setShowSuccess(true);
        }
        setPrevEntryCount(state.entries.length);
    }, [state.entries.length, prevEntryCount]);

    function handleAddEntry(entry: EntryInput) {
        dispatch({ type: 'ADD', payload: entry });
    }

    function handleEditEntry(entryId: number, entry: EntryInput) {
        dispatch({ type: 'EDIT', payload: { entryId, entry } });
    }

    function handleDismissError() {
        dispatch({ type: 'DISMISS_ERROR' });
    }

    function handleLocalNoteChange(key: string, value: string) {
        setLocalNotes((prev) => ({ ...prev, [key]: value }));
    }

    function handleSaveNote(entryId: number, note: string) {
        dispatch({ type: 'SET_NOTE', payload: { entryId, note } });
    }

    function formatLocalHM(iso: string): string {
        return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    return (
        <div className='min-h-screen bg-neutral-50'>
            <div className='mx-auto max-w-4xl px-4 py-6 sm:py-8 pb-20 space-y-6'>
                {/* Header */}
                <header className='text-center sm:text-left'>
                    <h1 className='text-3xl sm:text-4xl font-bold text-neutral-900'>Time Tracker</h1>
                    <p className='text-sm text-neutral-500 mt-1'>Track your time and calculate hours per engagement</p>
                </header>

                {/* Error Alert */}
                {state.error && (
                    <ErrorAlert error={state.error} onDismiss={handleDismissError} />
                )}

                {/* Success Notification */}
                {showSuccess && (
                    <SuccessNotification 
                        message='Entry added successfully!'
                        onDismiss={() => setShowSuccess(false)}
                    />
                )}

                {/* Add Entry Form */}
                <EntryForm onSubmit={handleAddEntry} />

                {/* Report Section */}
                <ReportSection 
                    report={report}
                    notes={state.notes}
                    localNotes={localNotes}
                    onLocalNoteChange={handleLocalNoteChange}
                    onSaveNote={handleSaveNote}
                    onEditEntry={handleEditEntry}
                    formatLocalHM={formatLocalHM}
                />

                {/* Empty State */}
                {state.entries.length === 0 && <EmptyState />}
            </div>
        </div>
    );
}
import { useState } from 'react';
import { EntryInput } from '@/types';
import { TimeInput } from './TimeInput';

type EntryFormProps = {
    onSubmit: (entry: EntryInput) => void;
};

export function EntryForm({ onSubmit }: EntryFormProps) {
    const [engagement, setEngagement] = useState('');
    const [category, setCategory] = useState('');
    const [start, setStart] = useState('');
    const [end, setEnd] = useState('');

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
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
                        className='bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-lg text-sm transition-colors'
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

export function EmptyState() {
    return (
        <div className='bg-white rounded-xl shadow-sm p-12 text-center'>
            <svg className='w-16 h-16 mx-auto text-neutral-300' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
            </svg>
            <h3 className='text-lg font-semibold text-neutral-900 mt-4'>No entries yet</h3>
            <p className='text-sm text-neutral-500 mt-1'>Add your first time entry to get started</p>
        </div>
    );
}

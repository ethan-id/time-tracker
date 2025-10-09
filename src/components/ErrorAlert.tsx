type ErrorAlertProps = {
    error: string;
    onDismiss: () => void;
};

export function ErrorAlert({ error, onDismiss }: ErrorAlertProps) {
    return (
        <div role='alert' className='bg-red-50 border-l-4 border-red-500 rounded-lg p-4 flex items-start justify-between shadow-sm'>
            <div className='flex items-start gap-3'>
                <svg className='w-5 h-5 text-red-500 mt-0.5' fill='currentColor' viewBox='0 0 20 20'>
                    <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z' clipRule='evenodd' />
                </svg>
                <span className='text-sm text-red-800'>{error}</span>
            </div>
            <button 
                className='text-red-500 hover:text-red-700 text-sm font-medium' 
                onClick={onDismiss}
            >
                Dismiss
            </button>
        </div>
    );
}

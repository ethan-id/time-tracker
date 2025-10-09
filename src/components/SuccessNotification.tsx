import { useEffect } from 'react';

type SuccessNotificationProps = {
    message: string;
    onDismiss: () => void;
};

export function SuccessNotification({ message, onDismiss }: SuccessNotificationProps) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onDismiss();
        }, 3000);

        return () => clearTimeout(timer);
    }, [onDismiss]);

    return (
        <div className='fixed top-4 right-4 z-50 animate-slide-in'>
            <div className='bg-green-50 border-l-4 border-green-500 rounded-lg p-4 shadow-lg flex items-center gap-3 min-w-[300px]'>
                <svg className='w-5 h-5 text-green-500 flex-shrink-0' fill='currentColor' viewBox='0 0 20 20'>
                    <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z' clipRule='evenodd' />
                </svg>
                <span className='text-sm font-medium text-green-800'>{message}</span>
                <button 
                    onClick={onDismiss}
                    className='ml-auto text-green-500 hover:text-green-700'
                >
                    <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
                        <path fillRule='evenodd' d='M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z' clipRule='evenodd' />
                    </svg>
                </button>
            </div>
        </div>
    );
}

import { useState, useEffect } from 'react';

type TimeInputProps = {
    label: string;
    value: string; // HH:mm format (24-hour)
    onChange: (value: string) => void;
};

export function TimeInput({ label, value, onChange }: TimeInputProps) {
    const [hours, setHours] = useState('');
    const [minutes, setMinutes] = useState('');
    const [period, setPeriod] = useState<'AM' | 'PM'>('AM');

    // Parse incoming 24-hour time into 12-hour format
    useEffect(() => {
        if (value) {
            const [h, m] = value.split(':').map(Number);
            if (!isNaN(h) && !isNaN(m)) {
                const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
                setHours(String(hour12));
                setMinutes(String(m).padStart(2, '0'));
                setPeriod(h >= 12 ? 'PM' : 'AM');
            }
        }
    }, [value]);

    // Convert to 24-hour format and notify parent
    const updateTime = (h: string, m: string, p: 'AM' | 'PM') => {
        const hour = parseInt(h) || 0;
        const min = parseInt(m) || 0;
        
        if (hour < 1 || hour > 12 || min < 0 || min > 59) return;

        let hour24 = hour;
        if (p === 'AM' && hour === 12) hour24 = 0;
        else if (p === 'PM' && hour !== 12) hour24 = hour + 12;

        const timeString = `${String(hour24).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
        onChange(timeString);
    };

    const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/\D/g, '');
        if (val === '' || (parseInt(val) >= 1 && parseInt(val) <= 12)) {
            setHours(val);
            if (val && minutes) {
                updateTime(val, minutes, period);
            }
        }
    };

    const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/\D/g, '');
        if (val === '' || (parseInt(val) >= 0 && parseInt(val) <= 59)) {
            setMinutes(val);
            if (hours && val) {
                updateTime(hours, val, period);
            }
        }
    };

    const handlePeriodToggle = (newPeriod: 'AM' | 'PM') => {
        setPeriod(newPeriod);
        if (hours && minutes) {
            updateTime(hours, minutes, newPeriod);
        }
    };

    return (
        <div className='flex flex-col gap-1.5'>
            <label className='text-sm font-medium text-neutral-700'>{label}</label>
            <div className='flex gap-2'>
                {/* Hours Input */}
                <input
                    type='text'
                    inputMode='numeric'
                    className='w-16 border border-neutral-300 rounded-lg px-3 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    value={hours}
                    onChange={handleHoursChange}
                    placeholder='12'
                    maxLength={2}
                />
                <span className='flex items-center text-neutral-400 font-medium'>:</span>
                {/* Minutes Input */}
                <input
                    type='text'
                    inputMode='numeric'
                    className='w-16 border border-neutral-300 rounded-lg px-3 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    value={minutes}
                    onChange={handleMinutesChange}
                    placeholder='00'
                    maxLength={2}
                />
                {/* AM/PM Toggle */}
                <div className='flex border border-neutral-300 rounded-lg overflow-hidden'>
                    <button
                        type='button'
                        className={`px-3 py-2 text-sm font-medium transition-colors ${
                            period === 'AM'
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-neutral-700 hover:bg-neutral-50'
                        }`}
                        onClick={() => handlePeriodToggle('AM')}
                    >
                        AM
                    </button>
                    <button
                        type='button'
                        className={`px-3 py-2 text-sm font-medium transition-colors border-l border-neutral-300 ${
                            period === 'PM'
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-neutral-700 hover:bg-neutral-50'
                        }`}
                        onClick={() => handlePeriodToggle('PM')}
                    >
                        PM
                    </button>
                </div>
            </div>
        </div>
    );
}

import { Entry } from '@/types';

type EntriesTableProps = {
    entries: Entry[];
    formatLocalHM: (iso: string) => string;
};

export function EntriesTable({ entries, formatLocalHM }: EntriesTableProps) {
    if (entries.length === 0) return null;

    return (
        <section className='bg-white rounded-xl shadow-sm p-5 sm:p-6'>
            <div className='flex items-center justify-between mb-4'>
                <h2 className='text-lg font-semibold text-neutral-900'>Recent Entries</h2>
                <span className='text-sm text-neutral-500'>{entries.length} total</span>
            </div>
            <div className='overflow-x-auto -mx-5 sm:-mx-6'>
                <div className='inline-block min-w-full align-middle px-5 sm:px-6'>
                    <table className='min-w-full'>
                        <thead>
                            <tr className='border-b border-neutral-200'>
                                <th className='text-left text-xs font-medium text-neutral-500 uppercase tracking-wider pb-3 pr-4'>OIT</th>
                                <th className='text-left text-xs font-medium text-neutral-500 uppercase tracking-wider pb-3 pr-4'>Engagement</th>
                                <th className='text-left text-xs font-medium text-neutral-500 uppercase tracking-wider pb-3 pr-4'>Category</th>
                                <th className='text-left text-xs font-medium text-neutral-500 uppercase tracking-wider pb-3 pr-4'>Start</th>
                                <th className='text-left text-xs font-medium text-neutral-500 uppercase tracking-wider pb-3 pr-4'>End</th>
                                <th className='text-left text-xs font-medium text-neutral-500 uppercase tracking-wider pb-3'>Min</th>
                            </tr>
                        </thead>
                        <tbody className='divide-y divide-neutral-100'>
                            {entries.map((e) => (
                                <tr key={e.id} className='hover:bg-neutral-50'>
                                    <td className='py-3 pr-4 text-sm text-neutral-900 font-semibold'>{e.oit.toFixed(1)}</td>
                                    <td className='py-3 pr-4 text-sm text-neutral-900 font-medium'>{e.engagement}</td>
                                    <td className='py-3 pr-4 text-sm text-neutral-600'>{e.category}</td>
                                    <td className='py-3 pr-4 text-sm text-neutral-600 font-mono'>{formatLocalHM(e.startISO)}</td>
                                    <td className='py-3 pr-4 text-sm text-neutral-600 font-mono'>{formatLocalHM(e.endISO)}</td>
                                    <td className='py-3 text-sm text-neutral-600'>{e.minutes}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
}

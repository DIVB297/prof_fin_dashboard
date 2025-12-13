import React from 'react'
interface GroupByProps {
    columnDefs: any[];
    groupBy: string[];
    setGroupBy: React.Dispatch<React.SetStateAction<string[]>>;
    gridRef: React.RefObject<any>;
}

const GroupBy = ({ columnDefs, groupBy, setGroupBy, gridRef }: GroupByProps) => {
    const [showGrouped, setShowGrouped] = React.useState<boolean>(false);
    return (
        <>
            <button onClick={() => setShowGrouped(!showGrouped)} style={{ marginBottom: '10px' }} className='px-2 py-1 border rounded bg-gray-200 w-full' >
                {showGrouped ? 'Hide Group By' : 'Group By'}
            </button>
            <div className='flex items-center flex-row w-full gap-2 overflow-auto'>
                {showGrouped &&
                    columnDefs.map(col => (
                        <button key={col.field} onClick={() => {
                            let newGroupBy = [...groupBy];
                            if (newGroupBy.includes(col.field!)) {
                                newGroupBy = newGroupBy.filter(field => field !== col.field);
                            } else {
                                newGroupBy.push(col.field!);
                            }
                            setGroupBy(newGroupBy);
                            if (gridRef.current?.api) {
                                gridRef.current.api.setRowGroupColumns(newGroupBy);
                            }
                        }} style={{ marginBottom: '10px', marginLeft: '10px' }} className={`px-2 py-1 border rounded ${groupBy.includes(col.field!) ? 'bg-blue-500 text-white' : 'bg-white text-black'}`}>
                            {col.headerName}
                        </button>
                    ))}
            </div>
        </>
    )
}

export default GroupBy
"use client"
import React, { useEffect, useCallback, useRef } from 'react'
import { AgGridReact } from 'ag-grid-react'; // React Data Grid Component
import { columnDefs } from '@/constants/columns';
import { getStockData } from '@/utils/stocksData';
import dummySymbols from '@/constants/symbols';
import { AllCommunityModule, ClientSideRowModelModule, ModuleRegistry, ValidationModule } from 'ag-grid-community';
// ModuleRegistry.registerModules([AllCommunityModule]);
import { RowGroupingModule } from "ag-grid-enterprise";
import GroupBy from './GroupBy';
ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    RowGroupingModule,
    ...(process.env.NODE_ENV !== "production" ? [ValidationModule] : []),
]);

const AllStocks = () => {
    const [rowData, setRowData] = React.useState<any[]>([]);
    const gridRef = useRef<AgGridReact>(null);
    const [groupBy, setGroupBy] = React.useState<string[]>([]);
    const [showGrouped, setShowGrouped] = React.useState<boolean>(false);

    // Initial data load
    useEffect(() => {
        const fetchInitialData = async () => {
            const initialData = await getStockData(dummySymbols)
            setRowData(initialData)
        }
        fetchInitialData()
    }, [])

    // Optimized update function for individual rows
    const updateStockData = useCallback(async () => {
        if (!gridRef.current?.api) return;

        const newData = await getStockData(dummySymbols);

        newData.forEach((stock: any) => {
            const rowNode = gridRef.current!.api.getRowNode(stock.symbol || stock.id);
            if (rowNode) {
                rowNode.updateData(stock);
            }
        });
    }, []);

    // Set up interval for updates
    useEffect(() => {
        const interval = setInterval(() => {
            updateStockData();
        }, 15000);

        return () => clearInterval(interval);
    }, [updateStockData])
    return (
        <div className='mt-4'>
            <GroupBy columnDefs={columnDefs} groupBy={groupBy} setGroupBy={setGroupBy} gridRef={gridRef} />
            <div style={{ height: 600, width: '100%' }} className="ag-theme-alpine">
                <AgGridReact
                    ref={gridRef}
                    rowData={rowData}
                    columnDefs={columnDefs}
                    pagination={true}
                    paginationPageSize={15}
                    getRowId={(params) => params.data.symbol || params.data.id}
                />
            </div>
        </div>
    )
}

export default AllStocks
"use client"
import React, { useEffect, useCallback, useRef } from 'react'
import { AgGridReact } from 'ag-grid-react'; // React Data Grid Component
import { columnDefs } from '@/constants/columns';
import { getStaticStockData, getStockData } from '@/utils/stocksData';
import dummySymbols from '@/constants/symbols';
import { AllCommunityModule, ClientSideRowModelModule, ModuleRegistry, ValidationModule,CellStyleModule } from 'ag-grid-community';
// ModuleRegistry.registerModules([AllCommunityModule]);
import { RowGroupingModule } from "ag-grid-enterprise";
import GroupBy from './GroupBy';
ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    RowGroupingModule,
    CellStyleModule,
    ...(process.env.NODE_ENV !== "production" ? [ValidationModule] : []),
]);

const AllStocks = () => {
    const [rowData, setRowData] = React.useState<any[]>([]);
    const gridRef = useRef<AgGridReact>(null);
    const [groupBy, setGroupBy] = React.useState<string[]>([]);
    const [isLoading, setIsLoading] = React.useState<boolean>(false);
    const [reFetch, setRefetch] = React.useState<boolean>(false);

    // Initial data load
    useEffect(() => {
        const fetchInitialData = async () => {
            setIsLoading(true);
            try {
                // const initialData = await getStockData(dummySymbols, true); // Always include Google Finance
                const {data: initialData} = await getStaticStockData(); // Fetch from static log
                setRowData(initialData);
            } catch (error) {
                console.error('Error fetching initial data:', error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchInitialData()
    }, [])

    // Optimized update function for individual rows
    const updateStockData = useCallback(async () => {
        console.log('🚀 updateStockData called');
        if (!gridRef.current?.api) {
            console.log('❌ Grid not ready, returning');
            return;
        }
        
        console.log('🔄 Setting reFetch to true, starting API call');
        setRefetch(true); // Set flag only if we're proceeding with the API call
        try {
            const newData = await getStockData(dummySymbols, true); // Always include Google Finance
            console.log('✅ API call completed, updating grid');

            newData.forEach((stock: any) => {
                const rowNode = gridRef.current!.api.getRowNode(stock.symbol || stock.id);
                if (rowNode) {
                    rowNode.updateData(stock);
                }
            });
        } catch (error) {
            console.error('Error updating stock data:', error);
        } finally {
            console.log('🏁 Setting reFetch to false');
            setRefetch(false); // Always clear the flag
        }
    }, []);

    // Set up interval for updates
    useEffect(() => {
        const interval = setInterval(() => {
            console.log(`🔍 Interval check - isLoading: ${isLoading}, reFetch: ${reFetch}`);
            if (!isLoading && !reFetch) {
                console.log('✅ Calling updateStockData');
                updateStockData();
            } else {
                console.log('❌ Skipping API call - conditions not met');
            }
        }, 15000);

        return () => clearInterval(interval);
    }, [updateStockData, isLoading, reFetch])
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
                    loading={isLoading}
                />
            </div>
        </div>
    )
}

export default AllStocks
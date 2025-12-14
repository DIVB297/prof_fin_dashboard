"use client"
import React, { useEffect, useCallback, useRef } from 'react'
import { AgGridReact } from 'ag-grid-react'; // React Data Grid Component
import { columnDefs } from '@/constants/columns';
import { getStaticStockData, getStockData } from '@/utils/stocksData';
import dummySymbols from '@/constants/symbols';
import { AllCommunityModule, ClientSideRowModelModule, ModuleRegistry, ValidationModule, CellStyleModule, GridApi, RowApiModule, HighlightChangesModule, PaginationModule, CustomFilterModule, TextFilterModule, NumberFilterModule, DateFilterModule } from 'ag-grid-community';
// ModuleRegistry.registerModules([AllCommunityModule]);
import { GroupFilterModule, MultiFilterModule, RowGroupingModule, SetFilterModule } from "ag-grid-enterprise";
import GroupBy from './GroupBy';
ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    RowApiModule,
    HighlightChangesModule,
    PaginationModule, TextFilterModule, NumberFilterModule, DateFilterModule, SetFilterModule, MultiFilterModule, GroupFilterModule, CustomFilterModule,
    RowGroupingModule,
    CellStyleModule,
    ValidationModule
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
                const initialData = await getStockData(dummySymbols, true); // Always include Google Finance
                // const {data: initialData} = await getStaticStockData(); // Fetch from static log
                setRowData(initialData);
            } catch (error) {
                console.error('Error fetching initial data:', error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchInitialData()
    }, [])

    const updateStockData = useCallback(async () => {
        if (!gridRef.current?.api) {
            return;
        }

        setRefetch(true);
        try {
            const newData = await getStockData(dummySymbols, true);

            newData.forEach((stock: any) => {
                const rowId = stock.symbol || stock.id;
                const rowNode = gridRef.current!.api.getRowNode(rowId);
                if (rowNode) {
                    rowNode.updateData(stock);
                }
            });
        } catch (error) {
            console.error('Error updating stock data:', error);
        } finally {
            setRefetch(false); // Always clear the flag
        }
    }, []);

    // Set up interval for updates
    useEffect(() => {
        const interval = setInterval(() => {
            if (!isLoading && !reFetch) {
                updateStockData();
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
                    paginationPageSize={20}
                    getRowId={(params) => params.data.symbol || params.data.id}
                    loading={isLoading}
                />
            </div>
        </div>
    )
}

export default AllStocks
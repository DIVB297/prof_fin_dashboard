import { dummyData } from "./dummy"
import { ColDef } from "ag-grid-community"

const data = Object.keys(dummyData)

const colDefs: ColDef[] = data.map((key) => {
    let rowGroup = false;
    let hide = false;
    
    const columnDef: ColDef = {
        headerName: key[0].toUpperCase() + key.slice(1),
        field: key,
        sortable: true,
        filter: true,
        resizable: true,
        hide: hide,
        rowGroup: rowGroup,
        enableCellChangeFlash: true,
        // cellStyle: { color: 'red', 'background-color': 'green' }
    };
    
    // Add color rules for gain/loss columns
    if (key === 'Gain/Loss') {
        columnDef.cellClassRules = {
            'ag-grid-cell-green': (params) => { return params.value >= 0; },
            'ag-grid-cell-red': (params) => { return params.value < 0; }
        };
        columnDef.valueFormatter = (params) => {
            if (params.value === null || params.value === undefined) return '';
            const value = typeof params.value === 'number' ? params.value : parseFloat(params.value);
            if (isNaN(value)) return params.value;
            const symbol = value >= 0 ? '+' : '';
            return `${symbol}${value.toFixed(2)}`;
        };
    }
    
    return columnDef;
});

export const columnDefs = colDefs
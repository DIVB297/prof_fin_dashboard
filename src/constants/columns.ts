import { dummyData } from "./dummy"
import { ColDef } from "ag-grid-community"
const data = Object.keys(dummyData)
const colDefs: ColDef[] = data.map((key) => {
    let rowGroup = false;
    let hide = false;
    // if(key === "averageAnalystRating") rowGroup = true;
    return {
        headerName: key[0].toUpperCase() + key.slice(1),
        field: key,
        sortable: true,
        filter: true,
        resizable: true,
        hide: hide,
        rowGroup: rowGroup,
        enableCellChangeFlash: true,
    };
})

export const columnDefs = colDefs
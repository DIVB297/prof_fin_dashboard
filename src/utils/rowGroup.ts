export function rowGroup (groupBy:string) {
    return {
        headerName: groupBy[0].toUpperCase() + groupBy.slice(1),
        field: groupBy,
        sortable: true,
        filter: true,
        resizable: true,
        hide: false,
        rowGroup: true,
        enableCellChangeFlash: true,
    };
}

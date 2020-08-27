export interface WarehouseInventory {
    [warehouse: string]: {
        [sku: string]: number,
    };
}
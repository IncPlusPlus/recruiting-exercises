export interface Shipment {
    [warehouse: string]: {
        [sku: string]: number,
    };
}
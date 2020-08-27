import {Shipment} from "./Shipment";
import {SkuMap} from "./SkuMap";
import {WarehouseInventory} from "./WarehouseInventory";

export class InventoryAllocator {

    /**
     * WARNING: This function modifies requestedSkus and warehouseInventory internally. If you need to
     * use the parameters you send into this function later, only send a defensive copy to this function.
     * to this function elsewhere, you should send a defensive copy to this function.
     * @param requestedSkus - the skus with quantities that were ordered by a customer
     * @param warehouseInventory - a map of warehouses where the values are <SKU, available quantity> key-value pairs.
     * @returns an array that contains either:
     *
     * 1. A single Shipment which specifies the warehouses that this order will be sourced from as well as
     * how many units of each product will be sourced from each respective warehouse
     *
     * 2. Nothing. This occurs when the warehouse inventory does not have enough supply to fulfill the order.
     */
    public cheapestShipment(requestedSkus: SkuMap, warehouseInventory: WarehouseInventory):
        Shipment[] {
        let shipment: Shipment = {};

        for (let warehouse in warehouseInventory) {
            if (Object.keys(requestedSkus).length === 0) {
                //Break if there are no more items in the request
                break;
            }

            let itemsUsedFromThisWarehouse: SkuMap = {};
            let fulfilledItems: string[] = [];

            for (let item in requestedSkus) {
                //Check if the warehouse contains the requested item.
                //`warehouseInventory[warehouse][item]` will be undefined or 0 if the item doesn't exist in the warehouse
                // or if there is no supply of that item. Since both of these are falsy, this is a reliable method of
                // determining whether the desired item exists and is in-stock at the given warehouse.
                if (warehouseInventory[warehouse][item]) {
                    //We can only take up to the amount that the warehouse has, never more than that.
                    let amountTaken = Math.min(requestedSkus[item], warehouseInventory[warehouse][item])
                    //Remove the units of "item" that we're taking from the warehouse
                    warehouseInventory[warehouse][item] -= amountTaken;
                    requestedSkus[item] -= amountTaken;

                    if (requestedSkus[item] === 0) {
                        //Make note that we no longer need to find this item in the warehouse
                        fulfilledItems.push(item);
                    }
                    itemsUsedFromThisWarehouse[item] = amountTaken;
                }
            }

            if (Object.keys(itemsUsedFromThisWarehouse).length > 0) {
                //Add the items we've taken from this warehouse to the shipment
                shipment[warehouse] = itemsUsedFromThisWarehouse;
            }
            for (let item of fulfilledItems) {
                //Remove items which we have fulfilled from the request
                delete requestedSkus[item];
            }
        }

        //If there are still items that haven't been fulfilled by a warehouse, return nothing.
        if (Object.keys(requestedSkus).length > 0) {
            return [];
        }
        //Wrap the answer in a singleton array because it keeps the test cases concise
        return [shipment];
    }
}
import {Shipment} from "./Shipment";
import {SkuMap} from "./SkuMap";
import {WarehouseInventory} from "./WarehouseInventory";

export class InventoryAllocator {

    private static shipFromWarehousesInAscendingOrder(requestedSkus: SkuMap, warehouseInventory: WarehouseInventory):
        Shipment {
        let shipment: Shipment = {};

        for (let warehouse in warehouseInventory) {
            if (Object.keys(requestedSkus).length === 0) {
                //Break if there are no more items in the request
                break;
            }

            let itemsUsedFromThisWarehouse: SkuMap = {};
            let fulfilledItems: string[] = [];

            for (let item in requestedSkus) {
                /*
                Check if the warehouse contains the requested item.
                `warehouseInventory[warehouse][item]` will be undefined or 0 if the item doesn't exist in the warehouse
                 or if there is no supply of that item. Since both of these are falsy, this is a reliable method of
                 determining whether the desired item exists and is in-stock at the given warehouse.
                */
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
            return {};
        }

        return shipment;
    }

    private static shipFromOneWarehouse(requestedSkus: SkuMap, warehouseName: string):
        Shipment {
        let shipment: Shipment = {};
        shipment[warehouseName] = requestedSkus;
        return shipment;
    }

    /**
     * Determines whether an order can be shipped from a single warehouse
     * @param requestedSkus the items and their quantities in the order
     * @param warehouseInventory the warehouses that we can ship from and their inventory
     * @returns a string naming the single warehouse with which this order can be fulfilled; else an empty string
     */
    private static shippableFromLoneWarehouse(requestedSkus: SkuMap, warehouseInventory: WarehouseInventory):
        string {
        for (let warehouse in warehouseInventory) {
            if (InventoryAllocator.containsSkuInventory(requestedSkus, warehouseInventory, warehouse)) {
                return warehouse;
            }
        }
        return "";
    }

    /**
     * Checks whether the specified warehouse can fulfill an entire order.
     * @param skuMap the items and their quantities in the order
     * @param warehouseInventory the warehouses that we can ship from and their inventory
     * @param warehouseName the name of the warehouse to check
     * @returns true if the named warehouse can fulfill the entire order; else false
     */
    private static containsSkuInventory(skuMap: SkuMap, warehouseInventory: WarehouseInventory, warehouseName: string): boolean {
        for (let item in skuMap) {
            //Check if the item exists in the warehouse
            if (warehouseInventory[warehouseName][item]) {
                if (warehouseInventory[warehouseName][item] < skuMap[item]) {
                    return false;
                }
            } else {
                return false;
            }
        }
        return true;
    }

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
        let shipment: Shipment;

        /*
         * For each item requested, make a collection of that item paired with an array of warehouses containing that item (and how many of the item)
         * sorted in descending order based on how many of that item the warehouse has.
         *
         * Then, iterate downward to determine what warehouses items will be taken from until the order is satisfied.
         * Now also run shipFromWarehousesInAscendingOrder. Use the results from whichever ships from fewer warehouses.
         * If it's a tie, then shipFromWarehousesInAscendingOrder is guaranteed to be cheaper. Return the results from that.
         */

        //This is a string which will be empty in the case when an order can't be fulfilled by a single warehouse.
        //Otherwise, it contains the name of a warehouse that can supply all of the ordered items.
        const canShipFromSingleWarehouse = InventoryAllocator.shippableFromLoneWarehouse(requestedSkus, warehouseInventory);

        if (canShipFromSingleWarehouse) {
            shipment = InventoryAllocator.shipFromOneWarehouse(requestedSkus, canShipFromSingleWarehouse);
        } else {
            shipment = InventoryAllocator.shipFromWarehousesInAscendingOrder(requestedSkus, warehouseInventory);
        }

        //If there are no warehouses being shipped from...
        if (Object.keys(shipment).length == 0) {
            //Return an empty array indicating the failure
            return [];
        }

        //Wrap the answer in a singleton array because it makes writing the test cases easier :P
        return [shipment];
    }
}
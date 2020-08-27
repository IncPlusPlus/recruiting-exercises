import {InventoryAllocator} from "./InventoryAllocator";

/**
 * This is a modified version of the original InventoryAllocator.uspec.ts that used to be present
 * at https://github.com/deliverr/recruiting-exercises/blob/e33dcb34b8267057f2c8ff53a93ff577abd8b653/inventory-allocator/src/InventoryAllocator.uspec.ts.
 * I've added some tests and adapted or removed tests that expected InventoryAllocator to return multiple suggested shipments.
 */
describe("Inventory Allocator", () => {

    let allocator: InventoryAllocator;

    beforeAll(() => {
        allocator = new InventoryAllocator();
    });

    it("should create one shipment where inventory is exactly matching", () => {
        expect(allocator.cheapestShipment({apple: 1}, {owd: {apple: 1}}))
            .toEqual([{owd: {apple: 1}}]);
    });

    it("should create one shipment where inventory is more than needed", () => {
        expect(allocator.cheapestShipment({apple: 1}, {owd: {apple: 10}}))
            .toEqual([{owd: {apple: 1}}]);
    });

    it("should create no shipments when there is not enough inventory", () => {
        expect(allocator.cheapestShipment({apple: 1}, {owd: {apple: 0}}))
            .toEqual([]);
    });

    it("shouldn't consider skipped warehouses in the output", () => {
        expect(allocator.cheapestShipment({apple: 1}, {owd: {apple: 0}, dm: {apple: 1}}))
            //This test case exists just to make sure the output is
            // "[{dm: {apple: 1}}]"
            // and not
            // "[{owd: {apple: 0}, dm: {apple: 1}}]"
            .toEqual([{dm: {apple: 1}}]);
    });

    it("should be able to split a single item across warehouses", () => {
        expect(allocator.cheapestShipment({apple: 10}, {
            owd: {apple: 5},
            dm: {apple: 5}
        }))
            .toEqual([{dm: {apple: 5}, owd: {apple: 5}}]);
    });

    it("should get items from the cheapest (first) warehouses", () => {
        expect(allocator.cheapestShipment({apple: 5}, {
            owd: {apple: 5}, dm: {apple: 5},
            sp: {apple: 5, orange: 2},
        }))
            .toEqual([{owd: {apple: 5}}]);
    });

    it("should be able to split two items across warehouses", () => {
        expect(allocator.cheapestShipment({apple: 5, banana: 5}, {
            owd: {apple: 5},
            dm: {banana: 5},
        }))
            .toEqual([{dm: {banana: 5}, owd: {apple: 5}}]);
    });


    it("should be able to split three items across warehouses even if the item order is different", () => {
        expect(allocator.cheapestShipment({orange: 2, banana: 5, apple: 10}, {
            owd: {apple: 10},
            dm: {banana: 5},
            sp: {orange: 2},
        }))
            .toEqual([{
                owd: {apple: 10},
                dm: {banana: 5},
                sp: {orange: 2},
            }]);
    });

    it("should be able to keep a 'happy case' item whole while splitting the rest of the order as necessary", () => {
        expect(allocator.cheapestShipment({strawberry: 15, orange: 4, banana: 6, apple: 7}, {
            owd: {orange: 2, strawberry: 2},
            dm: {banana: 4},
            sp: {strawberry: 3, apple: 7, orange: 2, banana: 2},
            pm: {strawberry: 15, orange: 8, apple: 20},
        }))
            .toEqual([{
                owd: {orange: 2, strawberry: 2},
                dm: {banana: 4},
                sp: {apple: 7, banana: 2, orange: 2, strawberry: 3},
                pm: {strawberry: 10}
            }]);
    });

    it("should fail to allocate if one sku is missing inventory", () => {
        expect(allocator.cheapestShipment({apple: 5, banana: 5, orange: 5},
            {
                owd: {apple: 5, orange: 2},
                dm: {banana: 5, orange: 2},
            }))
            .toEqual([]);
    });

});
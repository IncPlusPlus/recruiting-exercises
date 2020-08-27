

## Problem

The problem is compute the best way an order can be shipped (called shipments) given inventory across a set of warehouses (called inventory distribution). 

Your task is to implement a function that will to produce the cheapest shipment.

The first input will be an order: a map of items that are being ordered and how many of them are ordered. For example an order of apples, bananas and oranges of 5 units each will be 

`{ apple: 5, banana: 5, orange: 5 }`

The second input will be a list of object with warehouse name and inventory amounts (inventory distribution) for these items. For example, the inventory across two warehouses called owd and dm for apples, bananas and oranges could look like

`[ 
    {
    	name: owd,
    	inventory: { apple: 5, orange: 10 }
    }, 
    {
    	name: dm:,
    	inventory: { banana: 5, orange: 10 } 
    }
]`

You can assume that the list of warehouses is pre-sorted based on cost. The first warehouse will be less expensive to ship from than the second warehouse.

You can use any language of your choice to write the solution (internally we use Typescript/Javascript, Python, and some Java). Please write unit tests with your code, a few are mentioned below, but these are not comprehensive. Fork the repository and put your solution inside of the src directory and include a way to run your tests!

## Solution

I initially intended to stay inside my comfort zone and use Java to solve this. However, I poked around in the Git history and found that there was previously some TypeScript boilerplate present in the repo back when this problem expected InventoryAllocator to produce multiple shipment suggestions. I used this boilerplate code as a jumping-off point for writing [`InventoryAllocator`](./src/InventoryAllocator.ts).

I already knew JavaScript fairly well. After brushing up on my JS, I started learning about TS and began to experiment. I found out that I'm quite fond of TypeScript.

### Running the test suite

1. Be sure you've got Node.js set up and working on your machine.
1. Run `npm test` in your terminal with the working directory set to the root of the repository.
1. ???
1. Profit!
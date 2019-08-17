export class MarketHelper
{

    public static buyResources(room: Room, resource: ResourceConstant) :number
    {
        if(Game.market.credits < 1000000) return 0;
        // Amount to buy is locked at 3k for the moment.
        let amountBought = 0, orders = Game.market.getAllOrders({type: ORDER_SELL, resourceType: resource});
        if(orders.length && room.terminal) {
            orders = orders.filter((o: Order) => o.price < 0.1);
            if(orders.length) {
                orders.sort((a,b) => a.price - b.price);
                let totalCosts = 0, totalTransferCosts = 0;
                for(let i = 0, iEnd = 10; i < iEnd; i++) {
                    if(!orders[i] || amountBought >= 3000) break;
                    const remaining = 3000 - amountBought;
                    const amount = orders[i].remainingAmount > remaining ? remaining : orders[i].remainingAmount;
                    const txCosts = Game.market.calcTransactionCost(amount, room.name, orders[i].roomName || '');
                    if(room.terminal.store[RESOURCE_ENERGY] >= txCosts) {
                        if(Game.market.deal(orders[i].id, amount, room.name) === OK) {
                            amountBought += amount;
                            totalTransferCosts += txCosts || 0;
                            totalCosts += amount * orders[0].price;
                        }
                    }
                }
                if(amountBought > 0) {
                    console.log(`Bought ${amountBought} ${resource} for room ${room.name}. Costs ${totalCosts}C and ${totalTransferCosts} energy`);
                }
            }
        }

        return amountBought;
    }
}

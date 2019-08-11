import {Process} from '../ROS/process'
import {SpawnsHelper} from '../helpers/spawns'
import {BoostsHelper} from "../helpers/boosts";

// META
// room

// TODO: Each sub process now creates & suicides it's own creeps. this is not needed
export class AutoMakeBoosts extends Process
{
    private init()
    {

        this.meta.initialized = true;
    }

    private kill()
    {
        this.state = 'killed';
    }

    public run()
    {

        if(typeof this.meta.initialized === 'undefined') {
            this.init();
        }
        const room: Room = Game.rooms[this.meta.room];

        if(room && room.storage && room.labs.length) {
            try {
                this.handle(room);
            }
            catch(e) {
                console.log(`Error in autoMakeBoosts: ${e.message}`);
            }
        }
        else {
            this.kill();
        }
    }

    private buyResources(room: Room, resource: ResourceConstant) :number
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

    private requestResources(room: Room, resource: ResourceConstant) : boolean
    {
        return false;

        // for(let i in Game.rooms) {
        //     const r = Game.rooms[i];
        //     if(r.controller && r.controller.my && r.terminal && r.storage) {
        //         const terminalAmount = r.terminal.store[resource] || 0;
        //         const storageAmount = r.storage.store[resource] || 0;
        //         if(terminalAmount + storageAmount > 8000) {
        //             if(!global.OS.kernel.hasProcessForNameAndMetaKeyValue('sendResources', 'target', room.name) && !global.OS.kernel.hasProcessForNameAndMetaKeyValue('sendResources', 'room', r.name) && !global.OS.kernel.hasProcessForNameAndMetaKeyValue('haulResources', 'room', r.name)) {
        //                 global.OS.kernel.addProcess('sendResources', {room: r.name, target: room.name, resource: resource, amount: 3000}, this.ID);
        //             }
        //         }
        //     }
        // }

        // return false;
    }

    private handle(room: Room)
    {
        if(room.storage && !global.OS.kernel.hasProcessForNameAndMetaKeyValue('stockBoostsLab', 'room', room.name) && !global.OS.kernel.hasProcessForNameAndMetaKeyValue('makeBoosts', 'room', room.name) && !global.OS.kernel.hasProcessForNameAndMetaKeyValue('emptyLabs', 'room', room.name)) {
            const reaction = this.defineReaction(room);
            if(reaction) {
                global.OS.kernel.addProcess('makeBoosts', {room: room.name, boost: reaction, amount: 3000}, this.ID);
            }
        }
    }

    private defineReaction(room: Room) : string|null
    {
        if(room.storage) {
            let minerals: {resource: string, amount: number}[] = [];
            for(let x in global.BOOST_COMPONENTS) {
                const tier = BoostsHelper.defineTier(x as ResourceConstant);
                const amount = room.storage.store[x as ResourceConstant] || 0;
                const max = tier === 3 ? 12000 : 3000;
                if(amount < max) {
                    minerals.push({
                        resource: x,
                        amount: room.storage.store[x as ResourceConstant] || 0
                    });
                }
            }

            let targetMineral;

            for(let i in minerals) {
                const ingredients: ResourceConstant[] = global.BOOST_COMPONENTS[minerals[i].resource];
                let fAmount = room.storage.store[ingredients[0]] || 0;
                let sAmount = room.storage.store[ingredients[1]] || 0;
                if(room.terminal) {
                    fAmount += room.terminal.store[ingredients[0]] || 0;
                    sAmount += room.terminal.store[ingredients[1]] || 0;
                }
                if(fAmount >= 3000 && sAmount >= 3000) {
                    targetMineral = minerals[i].resource;
                    break;
                }
                else {
                    try {
                        if(this.requestResources(room, (fAmount < 3000 ? ingredients[0] : ingredients[1]))) {

                        }
                        else {
                            const ingredient = (fAmount < 3000 ? ingredients[0] : ingredients[1]);
                            if(ingredient.length === 1 && room.terminal && !room.terminal.cooldown) {
                                const amountBought = this.buyResources(room, ingredient);
                                if(amountBought > 0) break;
                            }
                        }
                    }
                    catch(e) {
                        console.log(`${e.message}`);
                    }
                }
            }
            if(targetMineral) {
                return targetMineral;
            }
        }

        return null;
    }
}

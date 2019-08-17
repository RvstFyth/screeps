import {Process} from '../ROS/process';

// OS.kernel.addProcess('resources', {room: 'W56S33', 0);
export class Resources extends Process
{

    private init(roomName: string)
    {
        if(!Memory.resourceRequests) {
            Memory.resourceRequests = {};
        }
        this.meta.initialized = true;
    }

    public run()
    {
        try {
            this.run2();
        }
        catch(e) {
            console.log(`Resources process crashed ${JSON.stringify(e)} for ${this.meta.room} | pID: ${this.ID}`);
        }
    }

    private run2()
    {
        if(!this.meta.initialized) {
            this.init(this.meta.room);
        }

        const base = Object.keys(MINERAL_MIN_AMOUNT);
        const room = Game.rooms[this.meta.room];
        const mineral = room.find(FIND_MINERALS)[0];

        // Check if there is a active order
        // if(this.meta.order) {
        //     const order = Game.market.getOrderById(this.meta.order);
        //     if(!order || !order.active || !order.remainingAmount) {
        //         this.meta.order = null;
        //     }
        // }

        if(mineral && room.terminal && room.storage) {
            const amountInTerminal = room.terminal.store[mineral.mineralType] || 0;
            const amountInStorage = room.storage.store[mineral.mineralType] || 0;

            if(Game.time % 10 === 0 && !room.terminal.cooldown && amountInTerminal > 10000) {
                // if there is more then enough energy we can accept a BUY order, else we place a SELL order
                if(!room.terminal.cooldown && room.storage.store[RESOURCE_ENERGY] && room.storage.store[RESOURCE_ENERGY] > 60000 && room.terminal.store[RESOURCE_ENERGY] > 30000) {
                    const orders = Game.market.getAllOrders({type: ORDER_BUY, resourceType: mineral.mineralType}).filter((o: Order) => o.remainingAmount > 0).sort((a,b) => b.price - a.price);
                    if(orders && orders.length) {
                        const amount = orders[0].remainingAmount > 1000 ? 1000 : orders[0].remainingAmount;
                        const res = Game.market.deal(orders[0].id, amount, room.name);
                        if(res === OK) {
                            console.log(`<span style="color:cyan">${room.name} accepted buy order for ${amount} ${mineral.mineralType} for ${(orders[0].price * amount).toFixed(3)} Credits</span>`);
                        }
                    }
                }
            }

            if(Game.time % 15 === 0 && amountInTerminal > 8000) {
                let hasActiveOrder = false;
                for(let i in Game.market.orders) {
                    if(Game.market.orders[i].roomName === room.name) {
                        hasActiveOrder = true;
                        break;
                    }
                }

                if(!hasActiveOrder) {
                    const orders = Game.market.getAllOrders({type: ORDER_SELL, resourceType: mineral.mineralType}).sort((a,b) => a.price - b.price);
                    let price = 0.1;
                    if(orders && orders.length) {
                        const min = orders[0].price;
                        if(min < 0.01) {
                            price = 0.01;
                        }
                        else {
                            price = min - 0.001;
                        }
                    }
                    const res = Game.market.createOrder(ORDER_SELL, mineral.mineralType, price, 1000, room.name);
                    if(res === OK) {
                        console.log(`<span style="color:cyan">${room.name} placed a sell order for ${mineral.mineralType} ${price}</span>`)
                    }
                }
            }

            // Fill terminal with the mineral
            if((!amountInTerminal || (amountInTerminal && amountInTerminal < 10000)) && amountInStorage > 100000 && !global.OS.kernel.hasProcessForNameAndMetaKeyValue('haulResourcesTerminal', 'room', room.name)) {
                const terminalMax = 30000;
                const missing = terminalMax - amountInTerminal;
                global.OS.kernel.addProcess('haulResourcesTerminal', {room: room.name, resource: mineral.mineralType, amount: missing}, 0);
            }
        }

        if(room && room.controller && room.controller.my && mineral && room.storage && room.terminal && room.terminal.my && !global.OS.kernel.hasProcessForNameAndMetaKeyValue('emptyOwnedRoom', 'room', room.name)) {
            for(let r of base) {
                const bAmount = (room.terminal.store[r as ResourceConstant] || 0) + (room.storage.store[r as ResourceConstant] || 0);
                if(bAmount < 4000) {
                    if(!Memory.resourceRequests[r]) Memory.resourceRequests[r] = [];
                    if(Memory.resourceRequests[r].indexOf(room.name) < 0) Memory.resourceRequests[r].push(room.name);
                }
                else {
                    if(Memory.resourceRequests[r] && Memory.resourceRequests[r].length) {
                        const index = Memory.resourceRequests[r].indexOf(room.name);
                        if(index > -1) {
                            Memory.resourceRequests[r].splice(index, 1);
                        }
                    }
                    if(bAmount > 20000 && !global.OS.kernel.hasProcessForNameAndMetaKeyValue('sendResources', 'room', room.name) && Memory.resourceRequests[r] && Memory.resourceRequests[r].length) {
                        for(let n in Memory.resourceRequests[r]) {
                            const targetR = Game.rooms[Memory.resourceRequests[r][n]];
                            if(!targetR || !targetR.controller || !targetR.controller.my || !targetR.terminal || !targetR.terminal.my) {
                                const index = Memory.resourceRequests[r].indexOf(n);
                                if(index > -1) {
                                    Memory.resourceRequests[r].splice(index, 1);
                                }
                                continue;
                            }
                            const freeSpaceInTerminal = targetR.terminal.storeCapacity - _.sum(targetR.terminal.store);
                            if(freeSpaceInTerminal > 30000 && !global.OS.kernel.hasProcessForNameAndMetaKeyValue('sendResources', 'target', Memory.resourceRequests[r][n])) {
                                global.OS.kernel.addProcess('sendResources', {room: room.name, target: Memory.resourceRequests[r][n], resource: r, amount: 6000}, 0);
                                const index = Memory.resourceRequests[r].indexOf(n);
                                if(index > -1) {
                                    Memory.resourceRequests[r].splice(index, 1);
                                }
                                break;
                            }
                        }
                    }
                }
            }
        }
    }
}

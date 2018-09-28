import {Process} from '../ROS/process'
import {SpawnsHelper} from '../helpers/spawns'

/**
 * THIS PROCESS IS A WIP
 */

// META
// room
// resourceType
// amount
export class SellResources extends Process
{
    private init()
    {
        this.meta.transfered = 0;
        this.meta.amountSold = 0;
        this.meta.transactionID = '';
        this.meta.shouldKill = false;
        this.meta.initialized = true;

        if(!Memory.marketLog) {
            Memory.marketLog = [];
        }
    }

    private killProcess() : void
    {
        if(Game.creeps[this.meta.creep]) {
            Game.creeps[this.meta.creep].suicide();
        }
        else {
            this.state = 'killed';
        }
    }

    public run()
    {
        try {
            this.run2();
        }
        catch(e) {
            console.log("Bug in sellResources: "+e.message);
        }
    }

    private run2() : void
    {
        const room = Game.rooms[this.meta.room];

        if(typeof this.meta.initialized === 'undefined') {
            this.init();
        }
        if(!this.meta.shouldKill && room && room.terminal && this.meta.amountSold < this.meta.amount) {
            const tAmount = room.terminal.store[this.meta.resourceType as ResourceConstant];
            if(this.meta.amountSold < this.meta.amount && this.meta.transfered >= this.meta.amount && tAmount && tAmount > 0) {
                if(!this.meta.transactionID && !room.terminal.cooldown) {
                    if(!this.findBestBuyOrder(room.terminal.store[RESOURCE_ENERGY])) {
                        this.createSellOrder();
                    }
                }
                else if(this.meta.transactionID) {
                    const order = Game.market.getOrderById(this.meta.transactionID);
                    if(!order || order.remainingAmount === 0) {
                        this.killProcess();
                    }
                }
            }
            else if(this.meta.transfered < this.meta.amount) {
                this.transport();
            }
        }
        else {
            this.killProcess();
        }
    }

    private transport() : void
    {
        if(!this.meta.shouldKill && this.meta.transfered < this.meta.amount && (!this.meta.creep || !Game.creeps[this.meta.creep])) {
            if(SpawnsHelper.spawnAvailable(Game.rooms[this.meta.room])) {
                SpawnsHelper.requestSpawn(this.ID, Game.rooms[this.meta.room],
                    [MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY],
                    {role: 'sellResourcesTransporter'}, 'creep')
            }
        }
        else if(Game.creeps[this.meta.creep] && Game.creeps[this.meta.creep].spawning) {

        }
        else if(Game.creeps[this.meta.creep]) {
            if(this.meta.transfered > this.meta.amount) {
                Game.creeps[this.meta.creep].suicide();
            }
            else {
                this.handleTransporter(Game.creeps[this.meta.creep]);
            }
        }
    }

    private handleTransporter(creep: Creep) : void
    {
        if(_.sum(creep.carry) === 0 && !this.meta.shouldKill) {
            if(creep.room.storage) {
                if(creep.withdraw(creep.room.storage, this.meta.resourceType) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(creep.room.storage);
                }
            }
            else {
                creep.suicide();
            }
        }
        else {
            if(creep.room.terminal) {
                const result = creep.transfer(creep.room.terminal, this.meta.resourceType);
                if(result === ERR_NOT_IN_RANGE) {
                    creep.moveTo(creep.room.terminal);
                }
                else if(result === OK) {
                    this.meta.transfered += creep.carryCapacity;
                }
            }
        }
    }

    private findBestBuyOrder(energyAvailable: number) : boolean
    {
        const orders = Game.market.getAllOrders({type: ORDER_BUY, resourceType: this.meta.resourceType}).filter((o: Order) => o.remainingAmount > 0);
        if(orders) {
            const highest = _.max(orders, o => o.price);
            const remainingAmount = this.meta.amount - this.meta.amountSold;
            const amount = remainingAmount < highest.remainingAmount ? remainingAmount : highest.remainingAmount;
            const txCosts = Game.market.calcTransactionCost(amount, this.meta.room, highest.roomName || '');
            if(energyAvailable >= txCosts) {
                if(Game.market.deal(highest.id, amount, this.meta.room) === OK) {
                    this.meta.amountSold += amount;
                    Memory.marketLog.push(`Sold ${amount} ${this.meta.resourceType} from ${this.meta.room} for ${highest.price * amount}C. transfer costs: ${txCosts}`);
                    return true;
                }
            }
        }
        return false;
    }

    private createSellOrder() : void
    {

    }
}

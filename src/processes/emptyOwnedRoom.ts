import {Process} from '../ROS/process';
import {SpawnsHelper} from '../helpers/spawns';

export class EmptyOwnedRoom extends Process
{

    public run()
    {
        try {
            this.run2();
        }
        catch(e) {
            console.log(`EmptyOwnedRoom process crashed`);
        }
    }

    private run2()
    {
        const room = Game.rooms[this.meta.room];
        const targetRoom = Game.rooms[this.meta.target];

        if(typeof this.meta.shouldKill === 'undefined') {
            this.meta.shouldKill = false;
        }

        if(room && room.controller && room.controller.my && room.terminal) {
            //if(!this.meta.shouldKill) {
                this.handleCreeps(room);
            //}

            const inTerminal = Object.keys(room.terminal.store).filter(r => r !== RESOURCE_ENERGY);
            let freeSpaceInTargetTerminal = targetRoom.terminal ? targetRoom.terminal.storeCapacity - _.sum(targetRoom.terminal.store) : 0;
            if(inTerminal && inTerminal.length && !room.terminal.cooldown) {
                for(let i in inTerminal) {
                    const amountInTerminal = room.terminal.store[inTerminal[i] as ResourceConstant];
                    let amount = amountInTerminal && amountInTerminal > 10000 ? 10000 : amountInTerminal;
                    if(amount && amount > freeSpaceInTargetTerminal) {
                        amount = freeSpaceInTargetTerminal;
                    }
                    if(amount) {
                        const transferCosts = Game.market.calcTransactionCost(amount, room.name, targetRoom.name);
                        const energyInTerminal = room.terminal.store[RESOURCE_ENERGY];
                        if((energyInTerminal >= transferCosts) && room.terminal.send(inTerminal[i] as ResourceConstant, amount, targetRoom.name) === OK) {
                            console.log(`${amount} - ${inTerminal[i]}`);
                            break;
                        }
                    }
                }
            }
            if(!inTerminal || !inTerminal.length && this.meta.shouldKill) {
                this.killProcess();
            }
            if(targetRoom && targetRoom.terminal && _.sum(targetRoom.terminal.store) > (targetRoom.terminal.storeCapacity / 2)) {
                if(!global.OS.kernel.hasProcessForNameAndMetaKeyValue('emptyTerminal', 'room', targetRoom.name)) {
                    global.OS.kernel.addProcess('emptyTerminal', {room: targetRoom.name}, this.ID);
                }
            }
        }
        else {
            this.killProcess();
        }
    }

    private killProcess()
    {
        const creep = Game.creeps[this.meta.transporter];
        if(creep) {
            creep.suicide();
        }
        else {
            this.state = 'killed';
        }
    }

    private handleCreeps(room: Room)
    {
        const creep = Game.creeps[this.meta.transporter];
        if(!creep && !this.meta.shouldKill) {
            if(SpawnsHelper.spawnAvailable(room)) {
                SpawnsHelper.requestSpawn(this.ID, room, [
                    MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY
                ], {role: 'emptyOwnedRoomTransporter'}, 'transporter');
            }
        }
        else if(creep && creep.spawning) {

        }
        else if(creep) {
            this.handleTransporter(creep);
        }
    }

    private handleTransporter(creep: Creep)
    {
        if(creep.room.storage && !creep.room.storage.store[creep.memory.target as ResourceConstant]) {
            creep.memory.target = '';
        }
        else if(creep.memory.target === RESOURCE_ENERGY && creep.room.terminal && creep.room.terminal.store[RESOURCE_ENERGY] > 50000) {
            creep.memory.target = '';
        }
        if(!creep.memory.target) {
            creep.memory.target = this.defineTargetResource(creep.room);
        }
        if(creep.memory.target && creep.room.storage && creep.room.terminal) {
            if(_.sum(creep.carry) === 0) {
                if(creep.withdraw(creep.room.storage, creep.memory.target as ResourceConstant) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(creep.room.storage);
                }
            }
            else {
                const res = creep.transfer(creep.room.terminal, _.findKey(creep.carry) as ResourceConstant);
                if(res === ERR_NOT_IN_RANGE) {
                    creep.moveTo(creep.room.terminal);
                }
            }
        }
    }

    private defineTargetResource(room: Room)
    {
        let resource;
        if(room.terminal && _.sum(room.terminal.store) > 0) {
            if(room.terminal.store[RESOURCE_ENERGY] < 50000) {
                resource = RESOURCE_ENERGY;
            }
            else {
                if(room.storage) {
                    resource = Object.keys(room.storage.store).filter(r => r !== RESOURCE_ENERGY)[0];
                }
            }
        }
        if(!resource) {
            this.meta.shouldKill = true;
            resource = RESOURCE_ENERGY;
        }
        return resource;
    }
}

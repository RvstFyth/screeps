import { Process } from "ROS/process";
import {SpawnsHelper} from "helpers/spawns";

export class FillNuke extends Process
{

    /**
     * META:
     * - room
     * - orderID
     * - amountHauled
     */
    public run()
    {
        const room = Game.rooms[this.meta.room];

        if(room && room.nuker) {
            if(room.nuker.energy < room.nuker.energyCapacity) {
                this.transport(RESOURCE_ENERGY, room);
            }
            else if(room.nuker.ghodium < room.nuker.ghodiumCapacity) {
                this.transport(RESOURCE_GHODIUM, room);
            }
            else {
                // Recycle creep and kill process
                const creep = Game.creeps[this.meta.creep];
                if(creep) {
                    creep.suicide();
                }
                else {
                    this.state = 'killed';
                }
            }
        }
        else {
            this.state = 'killed';
        }
    }

    private transport(resource: ResourceConstant, room: Room)
    {
        const creep = Game.creeps[this.meta.creep];
        if(!creep) {
            SpawnsHelper.requestSpawn(this.ID, room, [
                CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,
                MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,
            ], {role: 'nukeTransporter'}, 'creep');
        }
        else if(creep && creep.spawning) {

        }
        else if(creep) {
            if(creep.memory.harvesting && _.sum(creep.carry) === creep.carryCapacity) {
                creep.memory.harvesting = false;
            }
            else if(!creep.memory.harvesting && _.sum(creep.carry) === 0) {
                creep.memory.harvesting = true;
            }

            if(room.nuker) {
                if(creep.memory.harvesting) {
                    const storageAmount = room.storage ? room.storage.store[resource] || 0 : 0;
                    const terminalAmount = room.terminal ? room.terminal.store[resource] || 0 : 0;
                    const target: StructureTerminal|StructureStorage|undefined = storageAmount ? room.storage : room.terminal;
                    if(target && (storageAmount || terminalAmount)) {
                        if(!creep.pos.isNearTo(target)) {
                            creep.moveTo(target, {maxRooms: 1});
                        }
                        else {
                            let diff;
                            if(resource === RESOURCE_ENERGY) diff = room.nuker.energyCapacity - room.nuker.energy;
                            else  diff = room.nuker.ghodiumCapacity - room.nuker.ghodium;
                            let amount = diff > creep.carryCapacity ? creep.carryCapacity : diff;
                            let targetAmount = target.store[resource];
                            if(targetAmount && targetAmount < amount) {
                                amount = targetAmount;
                            }
                            creep.withdraw(target, resource, amount);
                            if(amount < creep.carryCapacity) creep.memory.harvesting = false;
                        }
                    }
                }
                else {
                    if(!creep.pos.isNearTo(room.nuker)) {
                        creep.moveTo(room.nuker);
                    }
                    else {
                        creep.transfer(room.nuker, resource);
                    }
                }
            }
        }
    }
}

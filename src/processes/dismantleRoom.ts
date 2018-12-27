import {Process} from '../ROS/process'
import {SpawnsHelper} from '../helpers/spawns'

// Process for dismantling abandoned rooms.
// OS.kernel.addProcess('dismantleRoom', {room: 'W56S33', target: 'W56S32'}, 0);
export class DismantleRoom extends Process
{

    run()
    {
        if(typeof this.meta.shouldKill === 'undefined') {
            this.meta.shouldKill = false;
        }
        const room = Game.rooms[this.meta.room];
        if(room) {
            this.handleDismantlers(room);
        }
        else {
            this.state = 'killed';
        }
    }

    handleDismantlers(room: Room)
    {
        if(!this.meta.creeps) {
            this.meta.creeps = [];
        }
        for(let n in this.meta.creeps) {
            if(!Game.creeps[this.meta.creeps[n]]) {
                this.meta.creeps[n] = null;
            }
            else if(Game.creeps[this.meta.creeps[n]].spawning) {

            }
            else {
                this.handleDismantler(Game.creeps[this.meta.creeps[n]]);
            }
        }

        this.meta.creeps = this.meta.creeps.filter((n: any) => n);

        if(!this.meta.shouldKill && this.meta.creeps < this.defineDismantlerCount(room)) {
            if(SpawnsHelper.spawnAvailable(room)) {
                SpawnsHelper.requestSpawn(this.ID, room,
                    [WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE],
                    {role: 'dismantler'}, 'creeps[]'
                )
            }
        }
        if(this.meta.shouldKill && !this.meta.creeps.length) {
            this.state = 'killed';
        }
    }

    defineDismantlerCount(room: Room)
    {
        return 1;
    }

    handleDismantler(creep: Creep)
    {
        if(_.sum(creep.carry) === 0) {
            creep.memory.harvesting = true;
            if(this.meta.shouldKill || (creep.ticksToLive && creep.ticksToLive < 100)) {
                creep.suicide();
            }
        }
        else if((creep.ticksToLive && creep.ticksToLive < 100) || _.sum(creep.carry) === creep.carryCapacity) {
            creep.memory.harvesting = false;
        }
        if(creep.memory.harvesting) {
            if(creep.room.name !== this.meta.target) {
                creep.moveTo(new RoomPosition(25,25,this.meta.target), {
                    reusePath: 5,
                    range: 15
                });
            }
            else {
                // Dismantle stuff!
                if(!creep.memory.target) {
                    const structures = creep.room.find(FIND_STRUCTURES, {
                        filter: (s: Structure) => s.structureType !== STRUCTURE_CONTAINER && s.structureType !== STRUCTURE_CONTROLLER
                    });
                    if(structures.length) {
                        const target = creep.pos.findClosestByRange(structures);
                        if(target) {
                            creep.memory.target = target.id;
                        }
                    }
                    else {
                        creep.memory.harvesting = false;
                        this.meta.shouldKill = true;
                    }
                }
                if(creep.memory.target) {
                    const target: Structure|null = Game.getObjectById(creep.memory.target);
                    if(target){
                        if(!creep.pos.isNearTo(target)) {
                            creep.moveTo(target);
                        }
                        else {
                            if(target instanceof StructureTower && target.energy > 0) {
                                creep.withdraw(target, RESOURCE_ENERGY);
                            }
                            else if(target instanceof StructureExtension && target.energy > 0) {
                                creep.withdraw(target, RESOURCE_ENERGY);
                            }
                            else {
                                creep.dismantle(target);
                            }
                        }
                    }
                    else {
                        creep.memory.target = '';
                    }
                }
            }
        }
        else { // Deliver energy
            if(creep.room.name !== this.meta.room) {
                creep.moveTo(new RoomPosition(25,25,this.meta.room), {
                    reusePath: 5,
                    range: 15
                });
            }
            else {
                let target;
                const links = creep.pos.findInRange(creep.room.links, 5, {
                    filter: (s: StructureLink) => s.energy < s.energyCapacity
                });
                if(links.length) {
                    target = links[0];
                }
                if(creep.room.storage && _.sum(creep.room.storage.store) < creep.room.storage.storeCapacity) {
                    target = creep.room.storage;
                }
                if(creep.room.terminal && _.sum(creep.room.terminal.store) < creep.room.terminal.storeCapacity) {
                    target = creep.room.terminal;
                }
                if(target) {
                    if(!creep.pos.isNearTo(target)) {
                        creep.moveTo(target);
                    }
                    else {
                        creep.transfer(target, RESOURCE_ENERGY);
                    }
                }
            }
        }
    }
}

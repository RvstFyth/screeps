import {Process} from '../ROS/process'
import {SpawnsHelper} from '../helpers/spawns'

// META:
// room
// target
// global.OS.kernel.addProcess('lootRoom', {room: 'W59S21', target: "W59S22"}, 0)
export class LootRoom extends Process
{

    run ()
    {
        if(typeof this.meta.doneLooting === 'undefined') {
            this.meta.doneLooting = false;
            this.meta.shouldKill = false;
        }
        if(this.meta.doneLooting) {

        }
        else {
            try {
                this.handleLooter(Game.rooms[this.meta.room]);
            }
            catch(e) {
                console.log("HandleLooter failed in the lootRoom process: "+e.message);
            }
        }
    }

    handleLooter(room: Room)
    {
        const creep = Game.creeps[this.meta.creep];
        if(this.meta.shouldKill && !creep) {
            this.state = 'killed';
        }
        else if(!creep) {
            if(SpawnsHelper.spawnAvailable(room)) {
                SpawnsHelper.requestSpawn(this.ID, room, [CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE],
                    {role: 'looter'}, 'creep'
                );
            }
        }
        else if(creep && creep.spawning) {

        }
        else {
            if(_.sum(creep.carry) === 0) {
                creep.memory.harvesting = true;
            }
            else if(_.sum(creep.carry) === creep.carryCapacity) {
                creep.memory.harvesting = false;
            }
            if(creep.memory.harvesting) {
                if(creep.room.name !== this.meta.target) {
                    creep.moveToRoom(this.meta.target);
                }
                else {
                    if(!this.meta.shouldKill) {
                        this.loot(creep);
                    }
                    else {
                        creep.suicide();
                    }
                }
            }
            else {
                this.deliver(creep);
            }
        }
    }

    deliver(creep: Creep)
    {
        if(creep.room.name !== this.meta.room) {
            creep.moveToRoom(this.meta.room);
        }
        else {
            // Look at area. Check if there is a link within 10 tiles from the exit. Check the entire height/width
            // So we check on a stroke of 49x10
            if(creep.room.storage && !creep.pos.isNearTo(creep.room.storage)) {
                creep.moveTo(creep.room.storage);
            }
            else if(creep.room.storage) {
                if(creep.transfer(creep.room.storage, _.findKey(creep.carry) as ResourceConstant) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(creep.room.storage);
                }
            }
        }
    }

    loot(creep: Creep)
    {
        if(creep.room.terminal && _.sum(creep.room.terminal.store) > 0) {
            // creep.transfer(creep.room.storage, _.findKey(creep.carry) as ResourceConstant);
            if(creep.withdraw(creep.room.terminal, _.findKey(creep.room.terminal.store) as ResourceConstant) === ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.terminal);
            }
        }
        else if(creep.room.storage && _.sum(creep.room.storage.store) > 0) {
            if(creep.withdraw(creep.room.storage, _.findKey(creep.room.storage.store) as ResourceConstant) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.storage);
            }
        }
        else {
            const labs = creep.room.labs.filter((l: StructureLab) => l.mineralAmount > 0 || l.energy > 0);
            const tmp = false;
            if(tmp) { //labs.length) {
                const target = creep.pos.findClosestByRange(labs);
                if(creep.withdraw(target, target.mineralType as ResourceConstant) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(target);
                }
            }
            else {
                let targets = creep.room.find(FIND_STRUCTURES,
                    {filter: (s: AnyStructure) =>
                        (s.structureType === STRUCTURE_TOWER || s.structureType === STRUCTURE_SPAWN || s.structureType === STRUCTURE_EXTENSION) && s.energy > 0
                });
                if(targets.length) {
                    const target = creep.pos.findClosestByRange(targets);
                    if(creep.withdraw(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                        creep.moveTo(target);
                    }
                }
                else {
                    // const nukers: Structure[] = creep.room.find(FIND_STRUCTURES, {
                    //     filter: (s: AnyStructure) => s.structureType === STRUCTURE_NUKER && s.energy > 0
                    // });
                    // if(nukers.length) {
                    //     console.log(creep.withdraw(nukers[0], RESOURCE_ENERGY));
                    //     if(creep.withdraw(nukers[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                    //         creep.moveTo(nukers[0]);
                    //     }
                    // }
                    //else {
                        const containers = creep.room.containers.filter((c: StructureContainer) => _.sum(c.store) > 0);
                        if(containers.length) {
                            const target = creep.pos.findClosestByRange(containers);
                            if(creep.withdraw(target, _.findKey(target.store) as ResourceConstant) === ERR_NOT_IN_RANGE) {
                                creep.moveTo(target);
                            }
                        }
                        else {
                            this.meta.shouldKill = true;
                        }
                    //}
                }
            }
        }
    }
}
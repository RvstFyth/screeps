import { Process } from "ROS/process";
import { SpawnsHelper } from "helpers/spawns";

export class RemoteBuilder extends Process
{

    public run()
    {
        const room = Game.rooms[this.meta.room];
        const creep = Game.creeps[this.meta.creep];

        if(room) {
            if(!creep) {
                SpawnsHelper.requestSpawn(this.ID, room, this.defineBodyParts(room),{role: "remoteBuilder"}, 'creep');
            }
            else if(creep && creep.spawning) {

            }
            else if(creep) {
                this.handleCreep(creep);
            }
        }
        else {
            if(!creep) {
                this.state = 'killed';
            }
            else {
                this.handleCreep(creep);
            }
        }
    }

    private handleCreep(creep: Creep)
    {
        if(creep.room.name !== this.meta.target) {
            creep.moveToRoom(this.meta.target);
        }
        else {
            if(!creep.memory.harvesting && creep.carry[RESOURCE_ENERGY] === 0) {
                creep.memory.harvesting = true;
            }
            else if(creep.memory.harvesting && _.sum(creep.carry) === creep.carryCapacity) {
                creep.memory.harvesting = false;
            }
            if(creep.memory.harvesting) this.getEnergy(creep);
            else if(!creep.room.spawns.length && Game.flags[this.meta.target+'_spawn']) this.buildInitialSpawn(creep);
            else this.build(creep);
        }
    }

    private build(creep: Creep)
    {
        let target: ConstructionSite|null;
        if(creep.memory.targetID) target = Game.getObjectById(creep.memory.targetID);
        else target = null;

        if(!target || !creep.memory.targetID) {
            if(creep.room.constructionSites.length) {
                const newTarget = creep.pos.findClosestByRange(creep.room.constructionSites);
                if(newTarget) {
                    creep.memory.targetID = newTarget.id;
                    target = newTarget;
                }
            }
        }
        if(target) {
            if(creep.build(target) === ERR_NOT_IN_RANGE) {
                creep.moveTo(target, {maxRooms: 1});
            }
        }
        else {
            // See if there are any ramparts below 10k
            const ramparts = creep.room.ramparts.filter((r: StructureRampart) => r.hits < 10000);
            if(ramparts.length) {
                const ramp = creep.pos.findClosestByRange(ramparts);
                if(ramp && creep.repair(ramp) === ERR_NOT_IN_RANGE) creep.moveTo(ramp, {maxRooms: 1});
            }
            else {
                // See if there is a container that needs to be repaired
                const containers = creep.room.containers.filter((c: StructureContainer) => c.hits < c.hitsMax * 0.8);
                if(containers.length) {
                    const cont = creep.pos.findClosestByRange(containers);
                    if(cont && creep.repair(cont) === ERR_NOT_IN_RANGE) creep.moveTo(cont, {maxRooms: 1});
                }
                else if(creep.room.controller) {
                    if(creep.upgradeController(creep.room.controller) === ERR_NOT_IN_RANGE) creep.moveTo(creep.room.controller)
                }
            }
        }
    }

    private getEnergy(creep: Creep)
    {
        if(creep.room.storage && creep.room.storage.store[RESOURCE_ENERGY] > creep.carryCapacity * 2) {
            if(creep.withdraw(creep.room.storage, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.storage);
            }
        }
        else {
            const containers = creep.room.containers.filter((c: StructureContainer) => c.store[RESOURCE_ENERGY] > creep.carryCapacity);
            if(containers.length) {
                const target = creep.pos.findClosestByRange(containers);
                if(target) {
                    if(creep.withdraw(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                        creep.moveTo(target);
                    }
                }
            }
            else {
                const remoteBuilders = creep.room.find(FIND_MY_CREEPS, {filter: (c: Creep) => c.memory.role === 'remoteBuilder'});
                let sources = creep.room.sources.filter((s: Source) => !s.pos.findInRange(remoteBuilders, 3).length);
                let target: Source|null;
                if(sources.length) {
                    target = creep.pos.findClosestByRange(sources);
                }
                else {
                    target = creep.pos.findClosestByRange(creep.room.sources);
                }
                if(target) {
                    if(creep.harvest(target) === ERR_NOT_IN_RANGE) {
                        creep.moveTo(target);
                    }
                }
            }
        }
    }

    private buildInitialSpawn(creep: Creep)
    {
        const flag = Game.flags[this.meta.target+'_spawn'];
        if(!creep.pos.inRangeTo(flag, 3)) {
            creep.moveTo(flag, {maxRooms: 1});
        }
        else {
            const constructionSites = flag.pos.lookFor(LOOK_CONSTRUCTION_SITES);
            if(constructionSites.length) {
                creep.build(constructionSites[0]);
            }
            else {
                // Check if the rampart is at this place and at least 5k
                const structs = flag.pos.lookFor(LOOK_STRUCTURES);
                if(!structs.length) {
                    flag.pos.createConstructionSite(STRUCTURE_RAMPART);
                }
                else {
                    const ramparts = structs.filter((s: Structure) => s.structureType === STRUCTURE_RAMPART && s.hits < 5000);
                    if(ramparts.length) {
                        creep.repair(ramparts[0]);
                    }
                    else {
                        // Place initial spawn
                        flag.pos.createConstructionSite(STRUCTURE_SPAWN);
                    }
                }
            }
        }
    }

    private defineBodyParts(room: Room) : BodyPartConstant[]
    {
        if(room.controller) {
            if(room.controller.level <= 6) {
                return [WORK,WORK,WORK,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE];
            }
            else if(room.controller.level === 7) {
                return [MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY];
            }
            else { // RCL8
                return [
                    MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,
                    WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,
                    CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY
                ];
            }
        }
        return [MOVE];
    }
}

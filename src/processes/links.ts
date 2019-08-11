import {Process} from '../ROS/process'
import {SpawnsHelper} from '../helpers/spawns'
import { BlueprintsHelper } from 'helpers/blueprint';


export class Links extends Process
{

    run()
    {
        const room = Game.rooms[this.meta.room];
        if(room && room.controller && room.controller.my) {
            if(room.storage && room.links.length) {
                const StorageLink = room.storage.pos.findInRange(room.links, 3);
                const upgradersLink = room.controller.pos.findInRange(room.links, 3)[0];
                if(StorageLink.length) {
                    if(StorageLink[0].energy < StorageLink[0].energyCapacity) {
                        let otherLinks = room.links.filter((l: StructureLink) => l.id !== StorageLink[0].id && l.energy > 0 && !l.cooldown);
                        if(upgradersLink) {
                            otherLinks = otherLinks.filter((l: StructureLink) => l.id !== upgradersLink.id);
                        }
                        if(otherLinks.length) {
                            for(let i in otherLinks) {
                                let missingAmount = 0;
                                if(upgradersLink && upgradersLink.energy < upgradersLink.energyCapacity) {
                                    missingAmount = upgradersLink.energyCapacity - upgradersLink.energy;
                                }
                                if((this.meta.last && this.meta.last === 'storage') && missingAmount >= otherLinks[i].energy) {
                                    otherLinks[i].transferEnergy(upgradersLink);
                                    this.meta.last = 'upgrader';
                                }
                                else {
                                    otherLinks[i].transferEnergy(StorageLink[0]);
                                    this.meta.last = 'storage';
                                }
                            }
                        }
                    }

                    this.handleCreep(StorageLink[0]);
                }
            }
        }
        else {
            this.state = 'killed';
        }
    }

    handleCreep(upgradersLink: StructureLink)
    {
        if(!this.meta.creep || !Game.creeps[this.meta.creep]) {
            if(SpawnsHelper.spawnAvailable(upgradersLink.room)) {
                let bodyParts;
                if(upgradersLink.room.controller && upgradersLink.room.controller.level < 6) {
                    bodyParts = [CARRY,CARRY,MOVE];
                }
                else {
                    bodyParts = [CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE];
                }
                SpawnsHelper.requestSpawn(this.ID, upgradersLink.room, bodyParts, {role: 'linkTransporter'}, 'creep');
            }
        }
        else if(Game.creeps[this.meta.creep].spawning) {
            // Define the spot between container and link, save it in meta
        }
        else if(Game.creeps[this.meta.creep]) {
            const creep: Creep = Game.creeps[this.meta.creep];
            if(_.sum(creep.carry) === 0)    {
                if(!creep.pos.isNearTo(upgradersLink)) {
                    creep.moveTo(upgradersLink);
                }
                else {
                    if(upgradersLink.energy > 0) {
                        creep.withdraw(upgradersLink, RESOURCE_ENERGY);
                    }
                    else {
                        const droppedResources = creep.pos.findInRange(FIND_DROPPED_RESOURCES, 1);
                        if(droppedResources.length) {
                            creep.pickup(droppedResources[0]);
                        }
                    }
                }
            }
            else {
                if(creep.room.storage) {

                    if(!creep.memory.targetX || !creep.memory.targetY) {
                        const room = creep.room;
                        if (room.memory.blueprintType && room.memory.blueprintKey) {
                            if (BlueprintsHelper.transporterSpots[room.memory.blueprintType] && BlueprintsHelper.transporterSpots[room.memory.blueprintType][room.memory.blueprintKey]) {
                                if (BlueprintsHelper.transporterSpots[room.memory.blueprintType][room.memory.blueprintKey][0]) {
                                    const pos = BlueprintsHelper.storageLinkerSpots[room.memory.blueprintType][room.memory.blueprintKey][0];
                                    if (pos) {
                                        creep.memory.targetX = room.memory.centerX + pos.x;
                                        creep.memory.targetY = room.memory.centerY + pos.y;
                                    }
                                }
                            }
                        }
                    }

                    if(creep.memory.targetX && creep.memory.targetY) {
                        if(creep.pos.x !== creep.memory.targetX || creep.pos.y !== creep.memory.targetY) {
                            creep.moveTo(creep.memory.targetX, creep.memory.targetY);
                        }
                    }
                    else {
                        if(!creep.pos.isNearTo(creep.room.storage)) {
                            creep.moveTo(creep.room.storage);
                        }
                    }
                    if(creep.pos.isNearTo(creep.room.storage)) {
                        creep.transfer(creep.room.storage, _.findKey(creep.carry) as ResourceConstant);
                    }
                }
            }
        }
    }
}

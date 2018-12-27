import {Process} from '../ROS/process'
import {SpawnsHelper} from '../helpers/spawns'


export class Links extends Process
{

    run()
    {
        const room = Game.rooms[this.meta.room];
        if(room && room.controller && room.controller.my) {
            if(room.storage && room.links.length) {
                const upgradersLink = room.storage.pos.findInRange(room.links, 3);
                if(upgradersLink.length) {
                    if(upgradersLink[0].energy < upgradersLink[0].energyCapacity) {
                        const otherLinks = room.links.filter((l: StructureLink) => l.id !== upgradersLink[0].id && l.energy > 0 && !l.cooldown);
                        if(otherLinks.length) {
                            for(let i in otherLinks) {
                                otherLinks[i].transferEnergy(upgradersLink[0]);
                            }
                        }
                    }

                    this.handleCreep(upgradersLink[0]);
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
                SpawnsHelper.requestSpawn(this.ID, upgradersLink.room, [CARRY,CARRY,MOVE,MOVE], {role: 'linkTransporter'}, 'creep');
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
                    if(!creep.pos.isNearTo(creep.room.storage)) {
                        creep.moveTo(creep.room.storage);
                    }
                    else {
                        creep.transfer(creep.room.storage, _.findKey(creep.carry) as ResourceConstant);
                    }
                }
            }
        }
    }
}

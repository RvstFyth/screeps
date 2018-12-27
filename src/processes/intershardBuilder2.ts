import {Process} from '../ROS/process'
import {SpawnsHelper} from '../helpers/spawns'
import { Rampart } from 'roles/rampart';

// META
// target
// creep
export class IntershardBuilder2 extends Process
{

    private init()
    {

    }

    public run()
    {
        // META
        // target
        // creep
        const creep = Game.creeps[this.meta.creep];

        if(creep) {
            if(creep.room.name !== this.meta.target) {
                creep.moveToRoom(this.meta.target);
            }
            else {
                if(creep.carry[RESOURCE_ENERGY] === 0) {
                    creep.memory.harvesting = true;
                }
                else if(creep.carry[RESOURCE_ENERGY] === creep.carryCapacity) {
                    creep.memory.harvesting = false;
                }
                if(creep.memory.harvesting) {
                    this.harvest(creep);
                }
                else {
                  const constructionSites = creep.room.find(FIND_CONSTRUCTION_SITES);
                  const ramparts = creep.room.ramparts.filter((r: StructureRampart) => r.hits < 7000);
                  const damaged = creep.room.find(FIND_STRUCTURES, {
                    filter: (s: Structure) => s.hits < s.hitsMax && s.structureType !== STRUCTURE_WALL && s.structureType !== STRUCTURE_RAMPART &&
                        !s.pos.findInRange(FIND_MY_CREEPS, 2, {
                          filter: (c: Creep) => c.name.substr(0, 2) === 'IB'
                        }).length
                  });
                    if(creep.room.controller && (creep.room.controller.level < 2 || creep.room.controller.ticksToDowngrade < 1000)) {
                      if(creep.room.controller && creep.upgradeController(creep.room.controller) === ERR_NOT_IN_RANGE)  {
                          creep.moveTo(creep.room.controller);
                      }
                    }
                    else if(ramparts.length) {
                      const target = creep.pos.findClosestByRange(ramparts);
                        if(target && creep.repair(target) === ERR_NOT_IN_RANGE) {
                            creep.moveTo(target);
                        }
                    }
                    else if(constructionSites.length) {
                        const target = creep.pos.findClosestByRange(constructionSites);
                        if(target && creep.build(target) === ERR_NOT_IN_RANGE) {
                            creep.moveTo(target);
                        }
                    }
                    else if(damaged.length) {
                      const target = creep.pos.findClosestByRange(damaged);
                      if(target && creep.repair(target) === ERR_NOT_IN_RANGE) {
                        creep.moveTo(target);
                      }
                    }
                    else {
                        let target;
                        const spawnToFill = creep.room.spawns.filter((s: StructureSpawn) => s.energy < s.energyCapacity);
                        if(spawnToFill.length) {
                            target = creep.pos.findClosestByRange(spawnToFill);
                        }
                        else {
                          const extensionsToFill = creep.room.extensions.filter((s: StructureExtension) => s.energy < s.energyCapacity);
                          if(extensionsToFill.length) {
                            target = creep.pos.findClosestByRange(extensionsToFill);
                          }
                          else {
                            const towersToFill = creep.room.towers.filter((s: StructureTower) => s.energy < s.energyCapacity);
                            if(towersToFill.length) {
                              target = creep.pos.findClosestByRange(towersToFill);
                            }
                          }
                        }
                        if(target) {
                          if(creep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                            creep.moveTo(target);
                          }
                        }
                        else if(creep.room.controller && creep.upgradeController(creep.room.controller) === ERR_NOT_IN_RANGE)  {
                            creep.moveTo(creep.room.controller);
                        }
                    }
                }
            }
        }
        else {
            this.state = 'killed';
        }
    }

    private harvest(creep: Creep)
    {
        const source = creep.pos.findClosestByRange(Game.rooms[this.meta.target].find(FIND_SOURCES_ACTIVE));

          if(source && !creep.pos.isNearTo(source)) {
            creep.moveTo(source);
            const tombstones = creep.pos.findInRange(FIND_TOMBSTONES, 1, {
              filter: (t: Tombstone) => t.store[RESOURCE_ENERGY] > 0 && creep.pos.inRangeTo(t,1)
            });
            if(tombstones.length) {
              creep.withdraw(tombstones[0], RESOURCE_ENERGY);
            }
          }
          else if(source) {
            const droppedResources = source.pos.findInRange(FIND_DROPPED_RESOURCES, 2, {
              filter: (s: Resource) => s.resourceType === RESOURCE_ENERGY && s.amount > creep.carryCapacity
            })
            if(droppedResources.length) {
              if(creep.pickup(droppedResources[0]) === ERR_NOT_IN_RANGE) {
                creep.moveTo(droppedResources[0]);
              }
            }
            else {
              const containers: StructureContainer[] = source.pos.findInRange(creep.room.containers, 2, {
                filter: (c: StructureContainer) => c.store[RESOURCE_ENERGY] > creep.carryCapacity
              });
              if(containers.length) {
                if(containers[0].store[RESOURCE_ENERGY] > creep.carryCapacity) {
                  if(creep.withdraw(containers[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(containers[0]);
                  }
                }
              }
              else {
                const miners = source.pos.findInRange(FIND_MY_CREEPS, 2, {
                  filter: (c: Creep) => c.memory.role === 'miner' && c.getActiveBodyparts(WORK) > 2
                });
                const tombstones = creep.pos.findInRange(FIND_TOMBSTONES, 1, {
                  filter: (t: Tombstone) => t.store[RESOURCE_ENERGY] > 0
                });
                if(tombstones.length) {
                  if(creep.withdraw(tombstones[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(tombstones[0]);
                  }
                }
                else if(!miners.length) {
                  const res = creep.harvest(source);
                  if(res === ERR_NOT_IN_RANGE) {
                    creep.moveTo(source);
                  }
                  else if(res === OK) {
                    const creeps = creep.pos.findInRange(FIND_MY_CREEPS, 1, {
                      filter: (c: Creep) => c.name.substr(0, 2) === 'IB'
                    });
                    if(creeps.length) {
                      creep.transfer(creeps[0], RESOURCE_ENERGY);
                    }
                  }
                }
                else {
                  // TODO:
                }
              }
            }
          }
    }
}

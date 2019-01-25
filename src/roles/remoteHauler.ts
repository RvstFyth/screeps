export class RemoteHauler
{

  static run(creep: Creep, room: string, targetRoom: string, sourceID: string)
  {
    // if(creep.name === '25_30300962') console.log(1);
    if(creep.carry[RESOURCE_ENERGY] === 0) {
      creep.memory.harvesting = true;
    }
    else if(creep.memory.harvesting && creep.carry[RESOURCE_ENERGY] === creep.carryCapacity) {
      creep.memory.harvesting = false;
      // Memory.stats['remotes.'+room+'.e']
    }
    const source: Source|null = Game.getObjectById(sourceID);

    if(creep.memory.harvesting) {
      if(creep.room.name !== targetRoom) {
        creep.moveTo(new RoomPosition(25,25,targetRoom), {
          reusePath: 5,
          range: 15
        });
      }
      else {
        if(source) {
          if(!creep.memory.targetX || !creep.memory.targetY) {
            const container = source.pos.findInRange(creep.room.containers, 1)[0];
            if(container) {
              creep.memory.targetX = container.pos.x;
              creep.memory.targetY = container.pos.y;
            }
            else {
              const construction = source.pos.findInRange(creep.room.constructionSites, 1).filter((c: ConstructionSite) => c.structureType === STRUCTURE_CONTAINER)[0];
              if(construction) {
                creep.memory.targetX = construction.pos.x;
                creep.memory.targetY = construction.pos.y;
              }
            }
          }
          if(creep.memory.targetX && creep.memory.targetY && !creep.pos.isNearTo(creep.memory.targetX, creep.memory.targetY)) {
              //if(!creep.pos.isNearTo(creep.memory.targetX, creep.memory.targetY)) {
                creep.moveTo(creep.memory.targetX, creep.memory.targetY, {maxRooms: 1});
              //}
          }
          else if(!creep.memory.targetX && !creep.memory.targetY && !creep.pos.inRangeTo(source, 2)) {
            creep.moveTo(source, {
              ignoreCreeps: true,
              maxRooms: 1
            });
          }
          else {
            const droppedResources = source.pos.findInRange(FIND_DROPPED_RESOURCES, 1);
            if(droppedResources.length) {
              if(creep.pos.isNearTo(droppedResources[0])) {
                creep.pickup(droppedResources[0]);
              }
              else {
                creep.moveTo(droppedResources[0], {
                  ignoreCreeps: true,
                  maxRooms: 1
                });
              }
            }
            else {
              const containers = source.pos.findInRange(creep.room.containers, 1);
              if(containers.length) {
                if(creep.pos.isNearTo(containers[0])) {
                  creep.withdraw(containers[0], RESOURCE_ENERGY);
                }
                else {
                  creep.moveTo(containers[0], {
                    ignoreCreeps: true,
                    maxRooms: 1
                  });
                }
              }
            }
          }
        }
      }
    }
    else {  // Deliver resources
      // if(creep.name === '25_30300962') console.log(1);
      let canContinue = true;
      if(source && creep.pos.inRangeTo(source, 2)) {
        const containers = source.pos.findInRange(creep.room.containers, 1, {
          filter: (c: StructureContainer) => c.hits < c.hitsMax
        });
        if(containers.length) {
          const res = creep.repair(containers[0]);
          if(res === ERR_NOT_IN_RANGE) {
            creep.moveTo(containers[0], {maxRooms: 1});
          }
          else if(res === OK) canContinue = false;
        }
      }
      if(canContinue && creep.room.name === targetRoom && creep.getActiveBodyparts(WORK) && creep.room.constructionSites.length) {
        const target = creep.pos.findClosestByRange(creep.room.constructionSites);
        if(target && creep.build(target) === ERR_NOT_IN_RANGE) {
          creep.moveTo(target, {
            maxRooms: 1
          });
        }
      }
      else if(canContinue && creep.room.name !== room) {
        const res = creep.moveTo(new RoomPosition(25,25,room), {
          reusePath: 5,
          range: 15
        });
        if(creep.getActiveBodyparts(WORK)) {
          const roads = creep.pos.findInRange(creep.room.roads, 1, {
            filter: (r: StructureRoad) => r.hits < r.hitsMax
          });
          if(roads.length) {
            creep.repair(roads[0]);
          }
        }
      }
      else if(canContinue) {
        const links = creep.pos.findInRange(creep.room.links, 5, {
          filter: (s: StructureLink) => s.energy < s.energyCapacity
        });
        if(links.length) {
          if(!creep.pos.isNearTo(links[0])) {
            creep.moveTo(links[0], {maxRooms: 1});
          }
          else {
            creep.transfer(links[0], RESOURCE_ENERGY);
          }
        }
        else {
          if(creep.room.storage) {
            if(!creep.pos.isNearTo(creep.room.storage)) {
              creep.moveTo(creep.room.storage);
            }
            else {
              creep.transfer(creep.room.storage, RESOURCE_ENERGY);
            }
          }
          if(creep.carry[RESOURCE_ENERGY] === 0 && creep.ticksToLive && creep.ticksToLive < 400) {
            creep.suicide();
          }
        }
      }
    }
  }
}

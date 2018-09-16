export class RemoteHauler
{

  static run(creep: Creep, room: string, targetRoom: string, sourceID: string)
  {
    if(creep.carry[RESOURCE_ENERGY] === 0) {
      creep.memory.harvesting = true;
    }
    else if(creep.carry[RESOURCE_ENERGY] === creep.carryCapacity) {
      creep.memory.harvesting = false;
    }

    if(creep.memory.harvesting) {
      if(creep.room.name !== targetRoom) {
        creep.moveTo(new RoomPosition(25,25,targetRoom), {
          reusePath: 5,
          range: 15
        });
      }
      else {
        const source: Source|null = Game.getObjectById(sourceID);
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
                creep.moveTo(creep.memory.targetX, creep.memory.targetY);
              //}
          }
          else if(!creep.memory.targetX && !creep.memory.targetY && !creep.pos.inRangeTo(source, 2)) {
            creep.moveTo(source, {
              ignoreCreeps: true
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
                  ignoreCreeps: true
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
                    ignoreCreeps: true
                  });
                }
              }
            }
          }
        }
      }
    }
    else {  // Deliver resources
      // if(creep.name === '19_10698684') {
      //   console.log(1);
      // }
      if(creep.room.name !== room) {
        const res = creep.moveTo(new RoomPosition(25,25,room), {
          reusePath: 5,
          range: 15
        });
        // if(creep.name === '19_10698684') {
        //   console.log(res);
        // }
      }
      else {
        const links = creep.pos.findInRange(creep.room.links, 5, {
          filter: (s: StructureLink) => s.energy < s.energyCapacity
        });
        if(links.length) {
          if(!creep.pos.isNearTo(links[0])) {
            creep.moveTo(links[0]);
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

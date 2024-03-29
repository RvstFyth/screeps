export class RemoteMiner
{

  static run(creep: Creep, targetRoom: string, sourceID: string)
  {
    if(creep.room.name !== targetRoom) {
      // creep.moveTo(new RoomPosition(25,25,targetRoom), {
      //   reusePath: 5,
      //   range: 23
      // });
      creep.moveToRoom(targetRoom, true, false);
    }
    else {
      const source: Source|null = Game.getObjectById(sourceID);
      const room: Room = Game.rooms[targetRoom];

      if(source) {
        if(creep.carry[RESOURCE_ENERGY] === 0) {
          creep.memory.harvesting = true;
        }
        else if(creep.carry[RESOURCE_ENERGY] === creep.carryCapacity) {
          creep.memory.harvesting = false;
        }

        if(creep.memory.harvesting) {
          this.harvest(creep, source);
        }
        else {
          let container;
          if(creep.memory.targetX && creep.memory.targetY) {
            container = creep.pos.findInRange(creep.room.containers, 1).filter((c: StructureContainer) => c.store[RESOURCE_ENERGY] < c.storeCapacity)[0];
          }
          if(container) {
            creep.drop(RESOURCE_ENERGY);
          }
          else {
            const creeps: Creep[] = creep.room.find(FIND_MY_CREEPS, {
              filter: (c: Creep) => c.memory.role === 'remotehauler' && c.memory.harvesting === true
            });
            const constructionSites = creep.pos.findInRange(creep.room.constructionSites, 2);
            if(creeps.length && creep.pos.isNearTo(creeps[0])) {
              creep.transfer(creeps[0], RESOURCE_ENERGY);
            }
            else if(constructionSites && constructionSites.length) {
              const target = creep.pos.findClosestByRange(constructionSites);
              if(target) {
                creep.build(target);
              }
            }
            else {
              const needRepair = creep.room.find(FIND_STRUCTURES, {
                filter: (s: Structure) => s.hits < s.hitsMax && s.structureType !== STRUCTURE_WALL && s.structureType !== STRUCTURE_RAMPART && s.structureType !== STRUCTURE_ROAD && s.pos.inRangeTo(creep, 2)
              });
              if(needRepair.length) {
                const target = creep.pos.findClosestByRange(needRepair);
                if(target) {
                  creep.repair(target);
                }
              }
              else {
                if(creep.pos.x === creep.memory.targetX && creep.pos.y === creep.memory.targetY) {
                  creep.drop(RESOURCE_ENERGY);
                }
                else {
                  creep.moveTo(creep.memory.targetX, creep.memory.targetY);
                }
              }
            }
          }
        }
      }
    }
  }

  static harvest(creep: Creep, source: Source)
  {
    if(!creep.memory.targetX || !creep.memory.targetY) {
      const container = source.pos.findInRange(creep.room.containers, 1).filter((c: StructureContainer) => c.store[RESOURCE_ENERGY] < c.storeCapacity)[0];
      if(container) {
        creep.memory.targetX = container.pos.x;
        creep.memory.targetY = container.pos.y;
      }
    }
    if(creep.memory.targetX && creep.memory.targetY) {
      if(creep.pos.x !== creep.memory.targetX || creep.pos.y !== creep.memory.targetY) {
        creep.moveTo(creep.memory.targetX, creep.memory.targetY, {
          maxRooms: 1
        });
      }
      if(creep.pos.isNearTo(source)) {
        creep.harvest(source);
      }
    }
    else {
      if(!creep.pos.isNearTo(source)) {
        creep.moveTo(source, {
          maxRooms: 1
        });
      }
      else {
        creep.harvest(source);
      }
    }
  }
}

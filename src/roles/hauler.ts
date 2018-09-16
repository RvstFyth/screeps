export class Hauler
{

  static run(creep: Creep, sourceID: string)
  {
    if(creep.carry[RESOURCE_ENERGY] === 0) {
      creep.memory.harvesting = true;
    }
    else if(creep.carry[RESOURCE_ENERGY] === creep.carryCapacity) {
      creep.memory.harvesting = false;
    }
    const source: Source|null = Game.getObjectById(sourceID);
    if(creep.memory.harvesting) {
      let c: StructureContainer|null = null;
      if(creep.room.storage) {
        // if(creep.pos.inRangeTo(creep.room.storage, 2)) {
        //   const cc: any = creep.pos.findInRange(FIND_STRUCTURES, 3, {filter: (s: StructureContainer) => s.structureType === STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] > creep.carryCapacity});
        //   if(cc) {
        //     c = cc[0];
        //   }
        // }
      }
      if(c) {
        if(creep.withdraw(c, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
          creep.moveTo(c);
        }
      }
      else if(source) {
        if(!creep.pos.inRangeTo(source, 2)) {
          creep.moveTo(source);
        }
        else {
          const resources = creep.room.find(FIND_DROPPED_RESOURCES);
          const inRange = source.pos.findInRange(resources, 1);
          if(inRange.length) {
            if(!creep.pos.isNearTo(inRange[0])) {
              creep.moveTo(inRange[0]);
            }
            else {
              creep.pickup(inRange[0]);
            }
          }
          else {
            const containers = source.pos.findInRange(creep.room.containers, 2).filter((c: StructureContainer) => c.store[RESOURCE_ENERGY] > creep.carryCapacity);
            if(containers.length) {
              if(creep.withdraw(containers[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                creep.moveTo(containers[0]);
              }
            }
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
          if(creep.transfer(creep.room.storage, RESOURCE_ENERGY) === OK && source) {
            creep.moveTo(source);
          }
        }
      }
    }
  }


  static defineBodyParts(room: Room)
  {
    let bodyParts;

    if(room.energyAvailable <= 300) {
        bodyParts = [CARRY, CARRY, MOVE, MOVE];
    }

    else if(room.energyAvailable <= 400) {
        bodyParts = [CARRY, CARRY, MOVE, MOVE];
    }
    else if(room.energyAvailable <= 500) {
        bodyParts = [CARRY,CARRY,CARRY,MOVE,MOVE,MOVE]; // 350
    }
    else if(room.energyAvailable < 1000) {
      bodyParts = [CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE];
    }
    else if(room.energyAvailable < 1500) {
        bodyParts = [CARRY,CARRY,CARRY,CARRY,CARRY, CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE];
    }
    else if(room.energyAvailable >= 1500) {
      bodyParts = [CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY, CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE];
    }
    else {
        bodyParts = [CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE];
    }

    return bodyParts;
  }
}
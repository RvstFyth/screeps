export class Upgrader
{
  static run(creep: Creep)
  {
    if(creep.carry[RESOURCE_ENERGY] === 0) {
      creep.memory.harvesting = true;
    }
    if(creep.carry[RESOURCE_ENERGY] === creep.carryCapacity) {
      creep.memory.harvesting = false;
    }
    if(creep.memory.harvesting) {
        if(typeof creep.room.storage !== 'undefined' && creep.room.storage.store[RESOURCE_ENERGY] >= creep.carryCapacity) {
          if(creep.withdraw(creep.room.storage, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
            creep.moveTo(creep.room.storage);
          }
        }
        else {
          const containers = creep.room.containers.filter((c: StructureContainer) => c.store[RESOURCE_ENERGY] > creep.carryCapacity);
          if(containers.length) {
            const target = creep.pos.findClosestByRange(containers);
            if(target && !creep.pos.isNearTo(target)) {
              creep.moveTo(target);
            }
            else if(target) {
              creep.withdraw(target, RESOURCE_ENERGY);
            }
          }
          else {
            const source = creep.pos.findClosestByRange(creep.room.sources);
            if(source && creep.harvest(source) === ERR_NOT_IN_RANGE) {
              creep.moveTo(source);
            }
          }
        }
    }
    else {
      // creep.say('🔺');
      creep.say(String.fromCodePoint(0x1F53A));
      if(typeof creep.room.controller !== 'undefined' && creep.upgradeController(creep.room.controller) === ERR_NOT_IN_RANGE) {
        creep.moveTo(creep.room.controller);
      }
    }
  }

  static defineBodyParts(room: Room)
  {
    if(room.controller && room.controller.level === 8) { // 25m15w10c
      return [MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY];
    }
    if(room.energyAvailable < 200) {
        return [];
    }
    if(room.energyAvailable <= 400) {
        return [WORK, CARRY, MOVE, MOVE]; // 200
    }
    else if(room.energyAvailable <= 600) {
        return [WORK,WORK,CARRY,MOVE,MOVE,MOVE]; // 400
    }
    else if(room.energyAvailable <= 900) {
        return [WORK,WORK,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE]; // 600
    }
    else if (room.energyAvailable <= 1200) {
      if (room.energyAvailable > 3500) {
        return [WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE];
      }
      else {
          return [WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE]; // 900
      }
    }
    else if(room.controller && room.controller.level ===  7) {
      if(room.energyAvailable > 3000) {
        return [MOVE,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE]
      }
      else {
        return [WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE]; // 900
      }
    }
    else {
      if (room.energyAvailable > 3500) {
        return [WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE];
      }
      else {
          return [WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE]; // 900
      }
    }
  }
}

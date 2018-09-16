export class Builder
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
      if(typeof creep.room.storage === 'undefined') {
        if(creep.harvest(creep.room.sources[0]) === ERR_NOT_IN_RANGE) {
          creep.moveTo(creep.room.sources[0]);
        }
      }
      else {
        if(!creep.pos.isNearTo(creep.room.storage)) {
          creep.moveTo(creep.room.storage);
        }
        else {
          creep.withdraw(creep.room.storage, RESOURCE_ENERGY);
        }
      }
    }
    else {
      let constructionSites: ConstructionSite[] = creep.room.find(FIND_CONSTRUCTION_SITES).filter((c: ConstructionSite) => c.structureType !== STRUCTURE_RAMPART && c.structureType !== STRUCTURE_WALL);
      if(constructionSites && constructionSites.length) {
        let target = creep.pos.findClosestByRange(constructionSites);
        if(creep.build(target) === ERR_NOT_IN_RANGE) {
          creep.moveTo(target);
        }
      }
      else {
        if(typeof creep.room.controller !== 'undefined') {
          if(creep.upgradeController(creep.room.controller) === ERR_NOT_IN_RANGE){
            creep.moveTo(creep.room.controller);
          }
        }
      }
    }
  }

  static defineBodyParts(room: Room)
  {
    let bodyParts;

    if(room.energyAvailable <= 300) {
        bodyParts = [WORK, CARRY, MOVE, MOVE];
    }

    else if(room.energyAvailable <= 400) {
        bodyParts = [WORK, CARRY, MOVE, MOVE];
    }
    else if(room.energyAvailable <= 500) {
        bodyParts = [WORK,CARRY,CARRY,MOVE,MOVE,MOVE]; // 350
    }
    else if(room.energyAvailable < 1500) {
        bodyParts = [WORK,CARRY,CARRY,CARRY,CARRY, CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE];
    }
    else if(room.energyAvailable >= 1500) {
      bodyParts = [WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY, CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE];
    }
    else {
        bodyParts = [WORK,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE];
    }

    return bodyParts;
  }
}

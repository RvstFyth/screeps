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
      if(typeof creep.room.storage === 'undefined' || (!creep.room.storage.my && !creep.room.storage.store[RESOURCE_ENERGY])) {
        const containers = creep.room.containers.filter((c: StructureContainer) => c.store[RESOURCE_ENERGY] > creep.carryCapacity * 2);
        if(containers && containers.length) {
          const target = creep.pos.findClosestByRange(containers);
          if(target && creep.withdraw(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
            creep.moveTo(target);
          }
        }
        else {
          const target = creep.pos.findClosestByRange(creep.room.sources);
          if(target && creep.harvest(target) === ERR_NOT_IN_RANGE) {
            creep.moveTo(target);
          }
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
      //let constructionSites: ConstructionSite[] = creep.room.find(FIND_CONSTRUCTION_SITES).filter((c: ConstructionSite) => c.structureType !== STRUCTURE_RAMPART && c.structureType !== STRUCTURE_WALL);
      const cs = creep.room.buildTarget;
      if(cs) {
        if(creep.build(cs) === ERR_NOT_IN_RANGE) {
          creep.moveTo(cs);
        }
      }
      else {
        if(creep.room.controller && creep.room.controller.level < 8) {
          if(creep.upgradeController(creep.room.controller) === ERR_NOT_IN_RANGE){
            creep.moveTo(creep.room.controller);
          }
        }
        else {
          if(!creep.memory.target) {
            const t = _.min(creep.room.ramparts, c => c.hits);
            creep.memory.target = t.id;
          }
          if(creep.memory.target) {
            const r: StructureRampart|null = Game.getObjectById(creep.memory.target);
            if(r) {
              if(creep.repair(r) === ERR_NOT_IN_RANGE) {
                creep.moveTo(r);
              }
            }
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

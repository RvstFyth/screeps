export class Rampart
{

  static run(creep: Creep)
  {
    if(creep.carry[RESOURCE_ENERGY] === 0) {
      creep.memory.harvesting = true;
      creep.memory.target = '';
    }
    else if(_.sum(creep.carry) === creep.carryCapacity) {
      creep.memory.harvesting = false;
    }

    if(creep.memory.harvesting) {
      if(creep.room.storage) {
        if(!creep.pos.isNearTo(creep.room.storage)) {
          creep.moveTo(creep.room.storage);
        }
        else {
          creep.withdraw(creep.room.storage, RESOURCE_ENERGY);
        }
      }
    }
    else { // Creep carries energy
      if(!creep.memory.target) {
        const constructionSites = creep.room.constructionSites.filter((c: ConstructionSite) => c.structureType === STRUCTURE_RAMPART);
        if(constructionSites.length) {
          const target = creep.pos.findClosestByRange(constructionSites);
          creep.memory.target = target.id;
          creep.memory.targetX = target.pos.x;
          creep.memory.targetY = target.pos.y;
        }
        else {
          // Find ramparts to repair
          const ramparts = creep.room.find(FIND_STRUCTURES, {
            filter: (s: Structure) => s.structureType === STRUCTURE_RAMPART
          });
          if(ramparts.length) {
            const target = _.min(ramparts, (r) => r.hits);
            creep.memory.target = target.id;
            creep.memory.targetX = target.pos.x;
            creep.memory.targetY = target.pos.y;
          }
        }
      }
      if(creep.memory.target) {
        if(!creep.pos.isNearTo(creep.memory.targetX, creep.memory.targetY)) {
          creep.moveTo(creep.memory.targetX, creep.memory.targetY);
        }
        else {
          const target: StructureRampart|ConstructionSite|null = Game.getObjectById(creep.memory.target);
          if(target) {
            if(target instanceof ConstructionSite) { // ConstructionSite
              if(creep.build(target as ConstructionSite) === OK) {
                // Define the newly build rampart as target for repair!
                const tmpPos = new RoomPosition(creep.memory.targetX, creep.memory.targetY, creep.room.name);
                const structures = tmpPos.lookFor(LOOK_STRUCTURES).filter((s: Structure) => s.structureType === STRUCTURE_RAMPART);
                if(structures.length) {
                  creep.memory.target = structures[0].id;
                }
                else {
                  creep.memory.target = '';
                }
              }
            }
            else {
              const ramparts = creep.pos.findInRange(creep.room.ramparts, 3);
              const ram = _.min(ramparts, c => c.hits);
              creep.repair(ram as StructureRampart);
            }
          }
        }
      }
    }
  }

  static defineBodyParts(room: Room)
  {
    if(room.energyAvailable < 200) {
        return [];
    }
    if(room.energyAvailable <= 400) {
        return [WORK, CARRY, MOVE];
    }
    else if(room.controller && room.controller.level === 8 && room.energyAvailable > 4000) {
      return [WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY, MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE];
    }
    else if(room.energyAvailable > 1000) {
        return [WORK,WORK,CARRY,MOVE,MOVE,MOVE, WORK,WORK,CARRY,MOVE,MOVE,MOVE];
    }
    else {
        return [WORK,WORK,CARRY,MOVE,MOVE,MOVE];
    }
  }
}

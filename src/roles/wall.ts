export class Wall
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
      if(creep.room.storage && creep.room.storage.store[RESOURCE_ENERGY] > creep.carryCapacity) {
        if(!creep.pos.isNearTo(creep.room.storage)) {
          creep.moveTo(creep.room.storage);
        }
        else {
          creep.withdraw(creep.room.storage, RESOURCE_ENERGY);
        }
      }
    }
    else { // Repair walls
      if(!creep.memory.target) {
        this.defineTarget(creep);
      }
      if(creep.memory.target) {
        if(!creep.pos.isNearTo(creep.memory.targetX, creep.memory.targetY)) {
          creep.moveTo(creep.memory.targetX, creep.memory.targetY);
        }
        else {
          const wall: StructureWall|null = Game.getObjectById(creep.memory.target);
          if(wall) {
            creep.repair(wall);
          }
          else {
            creep.memory.target = '';
          }
        }
      }
    }
  }

  static defineTarget(creep: Creep)
  {
    const target = _.min(creep.room.walls, (w: StructureWall) => w.hits);
    creep.memory.target = target.id;
    creep.memory.targetX = target.pos.x;
    creep.memory.targetY = target.pos.y;
  }
}

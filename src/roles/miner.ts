export class Miner
{

  static run(creep: Creep, sourceID: string, linkID: string)
  {
    const source: Source|null = Game.getObjectById(sourceID);
    if(source) {
      let link:StructureLink|null = null;
      if(linkID) {
        link = Game.getObjectById(linkID);
      }
      if(!creep.memory.targetX || !creep.memory.targetY) {
        this.defineMiningPosition(creep, source);
      }

      if(creep.memory.targetX && creep.memory.targetY) {
        if(creep.pos.x !== creep.memory.targetX || creep.pos.y !== creep.memory.targetY) {
          creep.moveTo(creep.memory.targetX, creep.memory.targetY);
          if(creep.pos.isNearTo(creep.memory.targetX, creep.memory.targetY)) {
            const pos = new RoomPosition(creep.memory.targetX, creep.memory.targetY, creep.room.name);
            const creeps = pos.lookFor(LOOK_CREEPS);
            if(creeps.length) {
              creep.moveTo(creeps[0].pos.x, creeps[0].pos.y);
              creeps[0].moveTo(creep.pos.x, creep.pos.y);
            }
          }
        }
        else {
          creep.harvest(source);
          if(link && creep.getActiveBodyparts(CARRY) > 0) {
            if(creep.carry[RESOURCE_ENERGY] === creep.carryCapacity) {
              creep.transfer(link, RESOURCE_ENERGY);
            }
          }
          else {
            creep.drop(RESOURCE_ENERGY);
          }
        }
      }
      else {
        if(!creep.pos.isNearTo(source)) {
          creep.moveTo(source);
        }
        else {
          creep.harvest(source);
          if(link && creep.getActiveBodyparts(CARRY) > 0) {
            if(creep.carry[RESOURCE_ENERGY] === creep.carryCapacity) {
              creep.transfer(link, RESOURCE_ENERGY);
            }
          }
          else {
            creep.drop(RESOURCE_ENERGY);
          }
        }
      }
    }
  }

  static defineMiningPosition(creep: Creep, source: Source)
  {
    const containersNearSource: StructureContainer[] = source.pos.findInRange(creep.room.containers, 2);
    if(containersNearSource.length) {
      creep.memory.targetX = containersNearSource[0].pos.x;
      creep.memory.targetY = containersNearSource[0].pos.y;
    }
  }

  static defineBodyParts(room: Room)
  {
    let bodyParts;

    if(/*room.energyCapacityAvailable < 500 && */room.energyAvailable <= 300) {
        bodyParts = [WORK, MOVE]; // 150
    }
    else if(room.energyAvailable <= 450) {
        bodyParts = [WORK,WORK,MOVE,MOVE]; // 300
    }
    else if(room.energyAvailable <= 700 ){
        bodyParts = [WORK, WORK, WORK, WORK, MOVE, MOVE, MOVE, CARRY]; // 550
    }
    else if(room.energyAvailable <= 800){
        bodyParts = [MOVE,MOVE,MOVE,MOVE,MOVE,WORK,WORK,WORK,WORK,WORK,CARRY];
    }
    else {
      bodyParts = [WORK,WORK,WORK,WORK,WORK,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE]; // 750
    }
    return bodyParts;
  }
}
export class Miner
{

  static run(creep: Creep, sourceID: string, linkID: string)
  {
    // if(creep.room.name === 'W51S32') {
    //   const CPU = Game.cpu.getUsed();
    //   creep.pos.findInRange(FIND_STRUCTURES, 1);
    //   console.log(`${(Game.cpu.getUsed() - CPU).toFixed(3)} CPU`);
    // }
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
          if(source.energy > 0) {
              creep.harvest(source);
          }
          else {
              const containers = creep.pos.findInRange(creep.room.containers, 1).filter((c: StructureContainer) => c.store[RESOURCE_ENERGY] > 0);
              if(link && containers.length && link.energy < link.energyCapacity) {
                creep.withdraw(containers[0], RESOURCE_ENERGY);
              }
          }
          if(link && creep.getActiveBodyparts(CARRY) > 0) {
            const miningPower = creep.getActiveBodyparts(WORK) * HARVEST_POWER;
            const freeCarry = creep.carryCapacity - creep.carry[RESOURCE_ENERGY];

            if(freeCarry < miningPower) {
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

    // if(/*room.energyCapacityAvailable < 500 && */room.energyAvailable <= 300) {
    //     bodyParts = [WORK, MOVE]; // 150
    // }
    // else

    // POWER CREEPS STUFF
    // 8, 10, 12, 14, 16
    let powerCreeps: PowerCreep[] = [];
    for(let n in Game.powerCreeps) {
      const pc = Game.powerCreeps[n];
      if(Game.powerCreeps[n].shard && pc.room && pc.room.name === room.name) {
        powerCreeps.push(Game.powerCreeps[n]);
      }
    }
    if(powerCreeps.length) {
        const pc: PowerCreep = powerCreeps[0];
        if(pc.powers[PWR_REGEN_SOURCE]) {
          const lvl = pc.powers[PWR_REGEN_SOURCE].level;
          const parts = [5, 8, 10, 12, 14, 16];
          let workParts = parts[lvl];
          let body = [];
          for(let i = 0; i < workParts; i++) {
            body.push(MOVE);
            body.push(WORK);
          }
          body.push(CARRY);
          body.push(CARRY);
          return body;
        }
    }

    if(room.energyCapacityAvailable <= 450) {
        bodyParts = [WORK,WORK,MOVE,MOVE]; // 300
    }
    else if(room.energyCapacityAvailable <= 700 ){
        bodyParts = [WORK, WORK, WORK, WORK, MOVE, MOVE]; // 550
    }
    else if(room.energyAvailable <= 800){
        bodyParts = [MOVE,MOVE,MOVE,MOVE,MOVE,WORK,WORK,WORK,WORK,WORK,CARRY];
    }
    else {
      bodyParts = [WORK,WORK,WORK,WORK,WORK,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE]; // 750
    }
    return bodyParts;
  }
}

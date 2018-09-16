export class MineralMiner
{


  static run(creep: Creep)
  {

    if(!creep.memory.targetID) {
      const mineral = creep.room.find(FIND_MINERALS)[0];
      if(mineral) {
        creep.memory.targetID = mineral.id;
      }
      else {
        creep.memory.targetID = '';
      }
    }

    const mineral: Mineral|null = Game.getObjectById(creep.memory.targetID);

    if(_.sum(creep.carry) === 0) {
      creep.memory.harvesting = true;
    }
    else if(_.sum(creep.carry) === creep.carryCapacity || (mineral && mineral.mineralAmount === 0)) {
      creep.memory.harvesting = false;
    }

    // TODO: Implement container mining
    if(creep.memory.harvesting) {
      if(mineral) {
        if(!creep.pos.isNearTo(mineral)) {
          creep.moveTo(mineral);
        }
        else {
          if(creep.room.extractor && !creep.room.extractor.cooldown) {
            creep.harvest(mineral);
          }
        }
      }
    }
    else if(mineral) {
      // TODO: Implement container mining
      let target;
      const storageAmount = creep.room.storage && creep.room.storage.store[mineral.mineralType] ? creep.room.storage.store[mineral.mineralType] : null;
      const terminalAmount = creep.room.terminal && creep.room.terminal.store[mineral.mineralType] ? creep.room.terminal.store[mineral.mineralType] : null;

      if(storageAmount && storageAmount >= 50000 && (!terminalAmount || terminalAmount < 30000)) {
        target = creep.room.terminal;
      }
      else {
        target = creep.room.storage;
      }

      if(target) {
        if(!creep.pos.isNearTo(target)) {
          creep.moveTo(target);
        }
        else {
          if(mineral) {
            creep.transfer(target, mineral.mineralType);
          }
        }
      }
    }
  }
}

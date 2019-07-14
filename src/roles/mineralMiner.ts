import { SpawnsHelper } from "helpers/spawns";

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

    if(creep.ticksToLive && creep.ticksToLive <= 51) {
      creep.memory.harvesting = false;
    }
    if(_.sum(creep.carry) === 0) {
      creep.memory.harvesting = true;
    }
    else if(_.sum(creep.carry) === creep.carryCapacity || (mineral && mineral.mineralAmount === 0)) {
      creep.memory.harvesting = false;
    }

    // TODO: Implement container mining
    if(creep.ticksToLive && creep.ticksToLive <= 51) {
      creep.memory.harvesting = false;
      if(_.sum(creep.carry) === 0) {
        creep.suicide();
      }
    }
    else if(creep.memory.harvesting) {
      if(mineral && mineral.mineralAmount > 0) {
        if(!creep.pos.isNearTo(mineral)) {
          creep.moveTo(mineral);
        }
        else {
          if(creep.room.extractor && !creep.room.extractor.cooldown) {
            creep.harvest(mineral);
            if(mineral.mineralAmount === 0) {
              creep.memory.harvesting = false;
            }
          }
          else {
            const thombstones = creep.pos.findInRange(FIND_TOMBSTONES, 1,{
              filter: (t: Tombstone) => t.store[mineral.mineralType]
            });
            if(thombstones.length) {
              creep.withdraw(thombstones[0], mineral.mineralType);
            }
          }
        }
      }
      else if(mineral && mineral.mineralAmount === 0 && _.sum(creep.carry) === 0) {
        const spawns = SpawnsHelper.getAvailableSpawns(creep.room);
        if(spawns.length) {
          if(spawns[0].recycleCreep(creep) === ERR_NOT_IN_RANGE) {
            creep.moveTo(spawns[0]);
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

  static defineBodyParts(room: Room) : BodyPartConstant[]
  {
    if(room.controller) {
      if(room.controller.level === 7) {
        return [WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE];
      }
      else if(room.controller.level === 8) {
        // 25 MOVE 15 WORK 10 CARRY
        return [MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY];
      }
    }
    return [WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE];
  }
}

import {SpawnsHelper} from '../helpers/spawns'

export class Transporter
{


  static run(creep: Creep, spot: { x: number, y: number } | null)
  {
    if(!creep.memory.targetID) {
      this.defineTarget(creep, '');
    }

    if(creep.carry[RESOURCE_ENERGY] === 0) {
      creep.memory.harvesting = true;
      creep.memory.targetID = null;
      creep.memory.target = '';
    }
    if(creep.carry[RESOURCE_ENERGY] === creep.carryCapacity) {
      creep.memory.harvesting = false;
    }

    if(creep.memory.harvesting) {
      if(typeof creep.room.storage !== 'undefined' && creep.room.storage.store[RESOURCE_ENERGY] > creep.carryCapacity) {
        if(creep.pos.isNearTo(creep.room.storage)) {
          creep.withdraw(creep.room.storage, RESOURCE_ENERGY);
        }
        else {
          creep.moveTo(creep.room.storage);
        }
      }
      else if(creep.room.terminal && creep.room.terminal.store[RESOURCE_ENERGY] > creep.carryCapacity) {
        if(creep.pos.isNearTo(creep.room.terminal)) {
          creep.withdraw(creep.room.terminal, RESOURCE_ENERGY);
        }
        else {
          creep.moveTo(creep.room.terminal);
        }
      }
    }
    else {
      if(creep.memory.targetID) {
        const target: any = Game.getObjectById(creep.memory.targetID);
        if(target) {
          if(creep.pos.isNearTo(target)) {
            const missing = target.energyCapacity - target.energy;
            const amount = creep.carry[RESOURCE_ENERGY] > missing ? missing : creep.carry[RESOURCE_ENERGY];
            const filled = target.energy + creep.carry[RESOURCE_ENERGY] >= target.energyCapacity;
            if(creep.transfer(target, RESOURCE_ENERGY) === OK && creep.carry[RESOURCE_ENERGY] > amount && filled) {
              this.defineTarget(creep, creep.memory.targetID);
              if(creep.memory.targetID && _.sum(creep.carry) > 0) {
                const t: AnyStructure|null = Game.getObjectById(creep.memory.targetID);
                if(t) {
                  creep.moveTo(t);
                }
              }
              else {
                if(creep.room.storage) {
                  creep.moveTo(creep.room.storage);
                }
              }
            }
            else if(creep.carry[RESOURCE_ENERGY] <= amount) {
              creep.memory.harvesting = false;
              if(creep.room.storage) creep.moveTo(creep.room.storage, {maxRooms: 1});
            }
          }
          else {
            creep.moveTo(target);
            const inRange = creep.pos.findInRange(creep.room.extensions, 1).filter((e: StructureExtension) => e.energy < e.energyCapacity);
            if(inRange.length) {
              creep.transfer(inRange[0], RESOURCE_ENERGY);
            }
          }
          if(target.energy === target.energyCapacity) {
            this.defineTarget(creep, creep.memory.targetID);
            if(creep.memory.targetID) {
              const t: AnyStructure|null = Game.getObjectById(creep.memory.targetID);
              if(t) {
                creep.moveTo(t);
              }
            }
          }
        }
      }
      else {
        if(_.sum(creep.carry) < creep.carryCapacity) {
          creep.memory.harvesting = true;
          if(creep.room.storage && !creep.pos.isNearTo(creep.room.storage)) {
            creep.moveTo(creep.room.storage);
          }
        }
        else {
          // TODO: renewCreep on a available spawn SpawnsHelper.getAvailableSpawns(room)
          const transporters = creep.room.find(FIND_MY_CREEPS, {filter: (c:Creep) => c.memory.role === 'transporter'});
          if(transporters.length < 2 && creep.ticksToLive && creep.ticksToLive < 500 &&  SpawnsHelper.spawnAvailable(creep.room)) {
            const target = creep.pos.findClosestByRange(SpawnsHelper.getAvailableSpawns(creep.room));
            if(target && creep.pos.isNearTo(target)) {
              target.renewCreep(creep);
            }
            else if(target) {
              creep.moveTo(target);
            }
          }
          else {
            // Get off the road
            if(spot && (creep.pos.x !== spot.x || creep.pos.y !== spot.y)) {
              creep.moveTo(spot.x, spot.y);
            }
          }
        }
      }
    }
  }

  static defineTarget(creep: Creep, ignoreID: string)
  {
    creep.memory.targetID = null;
    const assignedTargets = creep.room.find(FIND_MY_CREEPS, {filter: (c: Creep) => c.memory.role === 'worker' || c.memory.role === 'transporter'}).map((c: Creep) => c.memory.targetID);
    if(ignoreID) {
      assignedTargets.push(ignoreID);
    }
    const extensions = creep.room.extensions.filter((s: StructureExtension) => s.energy < s.energyCapacity && assignedTargets.indexOf(s.id) < 0);
    const spawns = creep.room.spawns.filter((s: StructureSpawn) => s.energy < s.energyCapacity && assignedTargets.indexOf(s.id) < 0);
    if(extensions.length || spawns.length) {
      const target = creep.pos.findClosestByRange([...extensions, ...spawns]);
      if(target) {
        creep.memory.targetID = target.id;
      }
    }
    else {
      const towers = creep.room.towers.filter((s: StructureTower) => s.energy < (s.energyCapacity * 0.8) && assignedTargets.indexOf(s.id) < 0);
      if(towers.length) {
        const target = creep.pos.findClosestByRange(towers);
        if(target) {
          creep.memory.targetID = target.id;
        }
      }
      else {
        const labs = creep.room.labs.filter((l: StructureLab) => l.energy < l.energyCapacity);
        if(labs.length) {
          const target = creep.pos.findClosestByRange(labs);
          if(target) {
            creep.memory.targetID = target.id;
          }
        }
        else {
          if(creep.room.terminal && creep.room.terminal.store[RESOURCE_ENERGY] < 50000 && creep.room.storage && creep.room.storage.store[RESOURCE_ENERGY] > 50000) {
            creep.memory.targetID = creep.room.terminal.id;
          }
          else if(creep.room.nuker && creep.room.nuker.energy < creep.room.nuker.energyCapacity && creep.room.storage && creep.room.storage.store[RESOURCE_ENERGY] > 80000) {
            creep.memory.targetID = creep.room.nuker.id;
          }
        }
      }
    }
  }

  static defineBodyParts(room: Room)
  {
    let bodyParts;
    const creeps = room.find(FIND_MY_CREEPS).length;

    if(!creeps && room.energyAvailable <= 300) {
        bodyParts = [CARRY,CARRY, MOVE, MOVE];
    }

    else if(room.controller && room.controller.level > 6 && room.energyAvailable > 1500) {
      return [CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY, CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE];
    }

    else if(room.energyAvailable <= 400) {
        bodyParts = [CARRY, CARRY, MOVE, MOVE];
    }
    else if(room.energyAvailable <= 500) {
        bodyParts = [CARRY,CARRY,CARRY,MOVE,MOVE,MOVE]; // 350
    }
    else if(room.energyAvailable >= 1000) {
        bodyParts = [CARRY,CARRY,CARRY,CARRY,CARRY, CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE];
    }
    else if(room.energyAvailable >= 1500) {
      bodyParts = [CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY, CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE];
    }
    else {
        bodyParts = [WORK,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE];
    }

    return bodyParts;
  }
}

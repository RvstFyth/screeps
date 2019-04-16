import {Process} from '../ROS/process'
import {SpawnsHelper} from '../helpers/spawns'
import {Upgrader} from '../roles/upgrader'

export class UpgradeRoom extends Process
{


  run()
  {
    const room = Game.rooms[this.meta.room];
    if(room.controller && room.controller.my && room.controller.level && room.controller.level < 8) {
      room.controller.say(`${(room.controller.progress / room.controller.progressTotal * 100).toFixed(1)}%`);
    }
    if(room && room.controller && room.controller.my) {
      if(!this.meta.creeps) {
        this.meta.creeps = [];
      }

      for(let n in this.meta.creeps) {

        if(!Game.creeps[this.meta.creeps[n]]) {
          this.meta.creeps[n] = null;
        }
        else if(Game.creeps[this.meta.creeps[n]].spawning) {
            if(room.controller && room.controller.level === 8) {
              Game.creeps[this.meta.creeps[n]].memory.initialized = true;
            }
            else {
              Game.creeps[this.meta.creeps[n]].memory.initialized = false;
            }
        }
        else if(Game.creeps[this.meta.creeps[n]]) {
          const creep = Game.creeps[this.meta.creeps[n]];
          if(typeof Game.creeps[this.meta.creeps[n]].memory.initialized === 'undefined') {
            Game.creeps[this.meta.creeps[n]].memory.initialized = true;
          }

          if(!creep.memory.initialized) {
            // catalyzed ghodium acid
            const labs = room.labs.filter((l: StructureLab) => l.mineralType === RESOURCE_CATALYZED_GHODIUM_ACID && l.mineralAmount >= 30);
            if(labs.length) {
              const result = labs[0].boostCreep(creep);
              if(result === ERR_NOT_IN_RANGE) {
                creep.moveTo(labs[0]);
              }
              else if(result === OK) {
                creep.memory.initialized = true;
              }
            }
            else {
              let boostsInStock = false;
              if(boostsInStock) {
                const workParts = Game.creeps[this.meta.creeps[n]].getActiveBodyparts(WORK);
                const mineralsNeeded = workParts * LAB_BOOST_MINERAL;
              }
              else {
                Game.creeps[this.meta.creeps[n]].memory.initialized = true;
              }
            }
          }
          else {
            Upgrader.run(Game.creeps[this.meta.creeps[n]]);
          }

        }
      }
      this.meta.creeps = this.meta.creeps.filter((n: any) => n); // Remove NULL values

      if(this.defineUpgradersCount(room) > 0 && this.meta.creeps.length < this.defineUpgradersCount(room)) {
        if(SpawnsHelper.spawnAvailable(room)) {
          SpawnsHelper.requestSpawn(this.ID, room, Upgrader.defineBodyParts(room), {role: 'upgrader'}, 'creeps[]');
        }
      }
    }
    else {
      this.state = 'killed';
    }
  }

  defineUpgradersCount(room: Room)
  {
    if(room.controller && room.controller.level === 8 && room.storage && room.storage.store[RESOURCE_ENERGY] > 500000) {
      return 1;
    }
    else if(room.controller && room.controller.level === 8 && room.storage && room.storage.store[RESOURCE_ENERGY] > 30000) {
      return 1;
    }
    else if(room.controller && room.controller.level === 8) {
      return 0;
    }
    else if(room.controller && room.controller.level === 7 && room.storage && room.storage.store[RESOURCE_ENERGY] < 150000) {
      return 1;
    }
    if(room.storage && room.storage.store[RESOURCE_ENERGY] < 200000) {
      return 2;
    }
    else if(room.storage) {
      return Math.floor(room.storage.store[RESOURCE_ENERGY] / 50000);
    }

    return 2;
  }
}

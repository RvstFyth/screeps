import {Process} from '../ROS/process'
import {SpawnsHelper} from '../helpers/spawns'
import {Worker} from '../roles/worker'

// OS.kernel.addProcess('claimRoom', {room: 'W59S21', target: 'W58S23'}, 0);
export class ClaimRoom extends Process
{


  run()
  {
    if(this.shouldRun()) {
      // if(this.meta.target === 'W59S36') {
      //   this.state = 'killed';
      // }

      // The room from where the creeps are spawned
      const room = Game.rooms[this.meta.room];
      const targetRoom = Game.rooms[this.meta.target];
      if(targetRoom && targetRoom.controller && targetRoom.controller.my) {
        if(!global.OS.kernel.hasProcessForNameAndMetaKeyValue('room', 'name', this.meta.target)) {
          global.OS.kernel.addProcess('room', {name: this.meta.target, support: true}, 0);
        }
      }
      this.handleClaimer(room);
      try {
          this.handleBuilder(room);
          this.handleClaimDefender(room);
      }
      catch(e) {
        console.log("Handle builder failed in claimRoom: " + e.message);
      }
    }
    else {
      this.state = 'killed';
    }
  }

  handleClaimDefender(room: Room)
  {
    if(!Game.creeps[this.meta.defender]) {
      if(SpawnsHelper.spawnAvailable(room)) {
        let bodyParts;
        if(room.controller && room.controller.level < 5) {
          bodyParts = [MOVE,MOVE,MOVE,MOVE,MOVE,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,HEAL,HEAL];
        }
        else {
          bodyParts = [RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,HEAL,HEAL,HEAL,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE];
        }
        this.meta.defender = SpawnsHelper.spawnCreep(room, bodyParts, {role: 'claimRoom_defender'}, this.ID.toString());
      }
    }
    else if(Game.creeps[this.meta.defender].spawning) {

    }
    else if(Game.creeps[this.meta.defender]) {
      const creep = Game.creeps[this.meta.defender];
      if(creep.room.name !== this.meta.target) {
        creep.moveToRoom(this.meta.target, true, true);
        creep.heal(creep);
      }
      else {
        if(creep.room.allies.length && Game.time % 16 === 0) {
          const closest = creep.pos.findClosestByRange(creep.room.allies);
          if(closest && creep.pos.inRangeTo(closest, 5)) {
            creep.say('Hi '+creep.room.allies[0].owner.username, true);
          }
        }
        let hostiles: Creep[] = creep.room.hostiles;

        if(hostiles.length) {
          const target: Creep| null = creep.pos.findClosestByRange(hostiles);
          if(target && creep.rangedAttack(target) === ERR_NOT_IN_RANGE) {
            creep.moveTo(target);
          }
          if(target) {
            if(creep.pos.inRangeTo(target, 3)) {
              creep.rangedAttack(target);
            }
            creep.flee(hostiles, 3);
            // else {
            //   creep.moveTo(target);
            // }
          }
          creep.heal(creep);
        }
        else {
          const damaged: Creep[] = creep.room.find(FIND_MY_CREEPS, {
            filter: (c: Creep) => c.hits < c.hitsMax
          });
          if(damaged && damaged.length) {
            const target = creep.pos.findClosestByRange(damaged);
            if(target && creep.pos.isNearTo(target)) {
              creep.heal(target);
            }
            if(target){
              creep.moveTo(target);
            }
            if(target && creep.pos.inRangeTo(target, 3)) {
              creep.rangedHeal(target);
            }

          }
          else {
            // const spawns = SpawnsHelper.getAvailableSpawns(creep.room);
            if(creep.ticksToLive && creep.ticksToLive < 500 && creep.room.energyAvailable === creep.room.energyCapacityAvailable) {
              // if(SpawnsHelper.spawnAvailable(room)) {
              //   const target: StructureSpawn|null = creep.pos.findClosestByRange(SpawnsHelper.getAvailableSpawns(creep.room));
              //   let builders: Creep[] = [];
              //   if(target) {
              //     builders = target.pos.findInRange(target.room.find(FIND_MY_CREEPS, {
              //       filter: (c:Creep) => c.memory.role === 'claimRoom_builder'
              //     }), 3);
              //   }
              //   if(!builders.length && target && creep.pos.isNearTo(target)) {
              //     target.renewCreep(creep);
              //   }
              //   else if(target) {
              //     creep.moveTo(target);
              //   }
              // }
            }
            else {
              const hostileExtensions = creep.room.find(FIND_HOSTILE_STRUCTURES, {
                filter: (s: Structure) => (s.structureType === STRUCTURE_EXTENSION || s.structureType === STRUCTURE_LINK)
              });
              if(hostileExtensions.length) {
                // console.log(1)
                const target = creep.pos.findClosestByRange(hostileExtensions);
                if(target && creep.rangedAttack(target) === ERR_NOT_IN_RANGE) {
                  creep.moveTo(target);
                }
              }
              else {
                if(creep.room.spawns.length) {
                  if(!creep.pos.inRangeTo(creep.room.spawns[0], 4)) {
                    creep.moveTo(creep.room.spawns[0], {
                      maxRooms: 1,
                      range: 4
                    });
                  }
                }
                else if(creep.room.controller && !creep.pos.inRangeTo(creep.room.controller, 3)) {
                  creep.moveTo(creep.room.controller, {
                    range: 3,
                    maxRooms: 1
                  });
                }
              }
            }
          }
        }
      }
    }
  }

  handleBuilder(room: Room)
  {
    if(!Game.creeps[this.meta.builder]) {
      if(SpawnsHelper.spawnAvailable(room)) {
        let bodyParts;
        if(room.controller && room.controller.level < 8) {
          bodyParts = [WORK,WORK,WORK,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE];
        }
        else {
          bodyParts = [
            MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,
            WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,
            CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY
          ]
        }
        this.meta.builder = SpawnsHelper.spawnCreep(room, bodyParts, {role: 'claimRoom_builder'}, this.ID.toString());
      }
    }
    else if(Game.creeps[this.meta.builder] && Game.creeps[this.meta.builder].spawning) {

    }
    else if(Game.creeps[this.meta.builder]) {
      const creep = Game.creeps[this.meta.builder];
      if(creep.room.name !== this.meta.target) {
        if(creep.room.name === this.meta.room && creep.carry[RESOURCE_ENERGY] === 0 && creep.room.storage) {
          if(creep.withdraw(creep.room.storage, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
            creep.moveTo(creep.room.storage);
          }
        }
        else {
          creep.moveToRoom(this.meta.target, true, true);
        }
      }
      else {
        // let carryLimit = creep.carryCapacity;
        // if(creep.hits < creep.hitsMax) {
        //   const bodyCount = creep.body.length;
        //   const moveParts = creep.getActiveBodyparts(MOVE);
        //   const workParts = creep.getActiveBodyparts(WORK);
        //   if(moveParts < bodyCount / 2) {

        //   }
        // }
        if(creep.carry[RESOURCE_ENERGY] === 0) {
          creep.memory.harvesting = true;
          creep.memory.targetID = null;
          this.meta.buildRenew = false;
        }
        else if(creep.carry[RESOURCE_ENERGY] === creep.carryCapacity) {
          creep.memory.harvesting = false;
        }

        if(creep.memory.harvesting) {

          let source: Source|null = creep.pos.findClosestByRange(Game.rooms[this.meta.target].sources, {
            filter: (s: Source) => s.energy > (creep.carryCapacity - creep.carry[RESOURCE_ENERGY])
          });
          if(!source) {
            source = creep.pos.findClosestByRange(Game.rooms[this.meta.target].sources);
          }

          if(creep.room.terminal && !creep.room.terminal.my && creep.room.terminal.store[RESOURCE_ENERGY] > 0) {
            if(creep.withdraw(creep.room.terminal, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
              creep.moveTo(creep.room.terminal);
            }
          }

          // else if(creep.room.storage && creep.room.storage.store[RESOURCE_ENERGY] > 20000) {
          //   if(creep.pos.isNearTo(creep.room.storage)) {
          //     creep.withdraw(creep.room.storage, RESOURCE_ENERGY);
          //   }
          //   else {
          //     creep.moveTo(creep.room.storage);
          //   }
          // }
          else if(source && !creep.pos.inRangeTo(source, 2)) {
            creep.moveTo(source);
          }
          else if(source) {
            const droppedResources = source.pos.findInRange(FIND_DROPPED_RESOURCES, 2, {
              filter: (s: Resource) => s.resourceType === RESOURCE_ENERGY && s.amount > creep.carryCapacity
            })
            if(droppedResources.length) {
              if(creep.pickup(droppedResources[0]) === ERR_NOT_IN_RANGE) {
                creep.moveTo(droppedResources[0]);
              }
            }
            else {
              const containers: StructureContainer[] = source.pos.findInRange(creep.room.containers, 2, {
                filter: (c: StructureContainer) => c.store[RESOURCE_ENERGY] > creep.carryCapacity
              });
              if(containers.length) {
                if(containers[0].store[RESOURCE_ENERGY] > creep.carryCapacity) {
                  if(creep.withdraw(containers[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(containers[0]);
                  }
                }
              }
              else {
                const hostileStructures: Structure[] = creep.room.find(FIND_HOSTILE_STRUCTURES, {
                  filter: (s: OwnedStructure) => (s.hasOwnProperty('store') && (s as any).store[RESOURCE_ENERGY] > 0) ||
                    s.hasOwnProperty('energy') && (s as any).energy > 0
                });
                if(hostileStructures.length) {
                  const target: Structure|null = creep.pos.findClosestByRange(hostileStructures);
                  if(target && creep.withdraw(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(target);
                  }
                }
                else {
                  const miners = source.pos.findInRange(FIND_MY_CREEPS, 2, {
                    filter: (c: Creep) => c.memory.role === 'miner' && c.getActiveBodyparts(WORK) > 2
                  })
                  if(!miners.length) {
                    if(creep.harvest(source) === ERR_NOT_IN_RANGE) {
                      creep.moveTo(source);
                    }
                    if(creep.pos.isNearTo(source) && source.energy === 0 && creep.carry[RESOURCE_ENERGY] > 0) creep.memory.harvesting = false;
                  }
                  else {
                    // TODO:
                  }
                }
              }
            }
          }
        }
        else {
          if(creep.room.controller && creep.room.controller.level < 2) {
            if(!creep.pos.inRangeTo(creep.room.controller, 3)) {
              creep.moveTo(creep.room.controller);
            }
            else {
              creep.upgradeController(creep.room.controller);
            }
            return true;
          }

          // claimRoom_builder
          if(!this.meta.buildRenew && creep.ticksToLive && creep.ticksToLive < 300) {
            this.meta.buildRenew = true;
          }
          if(this.meta.buildRenew && creep.ticksToLive && creep.ticksToLive >= 1200) {
            this.meta.buildRenew = false;
          }
          if(this.meta.buildRenew) {
            if(creep.room.spawns.length) {
              if(!creep.pos.isNearTo(creep.room.spawns[0])) {
                creep.moveTo(creep.room.spawns[0]);
              }
              else {
                if(creep.room.spawns[0].energy < creep.room.spawns[0].energyCapacity) {
                  creep.transfer(creep.room.spawns[0], RESOURCE_ENERGY);
                }
                creep.room.spawns[0].renewCreep(creep);
              }
              return true;
            }
          }

          if(!Game.rooms[this.meta.target].spawns.length) {

            if(!this.meta.spawnX || !this.meta.spawnY) {
              if(typeof Game.flags[this.meta.target + '_spawn'] !== 'undefined') {
                this.meta.spawnX = Game.flags[this.meta.target + '_spawn'].pos.x;
                this.meta.spawnY = Game.flags[this.meta.target + '_spawn'].pos.y;
                Game.rooms[this.meta.target].createConstructionSite(Game.flags[this.meta.target + '_spawn'].pos.x, Game.flags[this.meta.target + '_spawn'].pos.y, STRUCTURE_RAMPART);
              }
              else {
                const rampartConstructionSites = Game.rooms[this.meta.target].constructionSites.filter((c: ConstructionSite) => c.structureType === STRUCTURE_SPAWN);
                if(rampartConstructionSites.length) {
                  this.meta.spawnX = rampartConstructionSites[0].pos.x;
                  this.meta.spawnY = rampartConstructionSites[0].pos.y;
                }
              }
            }
            else {
              if(!creep.pos.inRangeTo(this.meta.spawnX, this.meta.spawnY, 2)) {
                creep.moveTo(this.meta.spawnX, this.meta.spawnY);
              }
              else {
                const ramparts: StructureRampart[] = creep.pos.findInRange(Game.rooms[this.meta.target].ramparts, 2);
                if(ramparts && ramparts.length) {
                  if(ramparts[0].hits < 5000) {
                    creep.repair(ramparts[0]);
                  }
                  else {
                    const spawnsConstructionSite = creep.pos.findInRange(Game.rooms[this.meta.target].constructionSites.filter((c: ConstructionSite) => c.structureType === STRUCTURE_SPAWN), 2);
                    if(spawnsConstructionSite.length) {
                      creep.build(spawnsConstructionSite[0]);
                    }
                    else {
                      Game.rooms[this.meta.target].createConstructionSite(this.meta.spawnX, this.meta.spawnY, STRUCTURE_SPAWN);
                    }
                  }
                }
                else { // Build the rampart
                  const spawnsConstructionSite = creep.pos.findInRange(Game.rooms[this.meta.target].constructionSites.filter((c: ConstructionSite) => c.structureType === STRUCTURE_SPAWN), 2);
                  if(spawnsConstructionSite.length) {
                    creep.build(spawnsConstructionSite[0]);
                  }
                  else {
                    const target = creep.pos.findInRange(Game.rooms[this.meta.target].constructionSites.filter((c: ConstructionSite) => c.structureType === STRUCTURE_RAMPART), 2);
                    if(target.length) {
                      creep.build(target[0]);
                    }
                    else {
                      Game.rooms[this.meta.target].createConstructionSite(this.meta.spawnX, this.meta.spawnY, STRUCTURE_SPAWN);
                    }
                  }
                }
              }
            }
          }
          else { // Spawn is builded
            if(!global.OS.kernel.hasProcessForNameAndMetaKeyValue('room', 'name', this.meta.target)) {
              global.OS.kernel.addProcess('room', {name: this.meta.target, support: true}, 0);
            }
            Worker.run(creep, '', '');

            // if(Game.rooms[this.meta.target].constructionSites.length) {
            //     const target: ConstructionSite|null = creep.pos.findClosestByRange(Game.rooms[this.meta.target].constructionSites);
            //     if(target && !creep.pos.inRangeTo(target, 2)) {
            //       creep.moveTo(target);
            //     }
            //     else if(target) {
            //       creep.build(target);
            //     }
            // }
            // else {
            //   // claimRoom_builder
            //   if(creep.room.controller) {
            //     if(!creep.pos.inRangeTo(creep.room.controller, 3)) {
            //         creep.moveTo(creep.room.controller);
            //     }
            //     else {
            //       creep.upgradeController(creep.room.controller);
            //     }
            //   }
            // }
          }
        }
      }
    }
    return true;
  }

  handleClaimer(room: Room)
  {
    const targetRoom = Game.rooms[this.meta.target];
    if(targetRoom && targetRoom.controller && targetRoom.controller.my) {
      // Do a funky dance
    }
    else {
      if(!Game.creeps[this.meta.claimer]) {
        if(SpawnsHelper.spawnAvailable(room)) {
          this.meta.claimer = SpawnsHelper.spawnCreep(room, [CLAIM,MOVE], {role: 'claimer'}, this.ID.toString());
        }
      }
      else if(Game.creeps[this.meta.claimer] && Game.creeps[this.meta.claimer].spawning) {

      }
      else if(Game.creeps[this.meta.claimer] && Game.flags[this.ID]) {
        const creep = Game.creeps[this.meta.claimer];
        if(!creep.pos.isNearTo(Game.flags[this.ID])) {
          creep.moveTo(Game.flags[this.ID]);
        }
        else {
          Game.flags[this.ID].remove();
        }
      }
      else if(Game.creeps[this.meta.claimer]) {
        const creep = Game.creeps[this.meta.claimer];
        if(creep.room.name !== this.meta.target) {
          creep.moveToRoom(this.meta.target, true, true);
        }
        else {
          if(creep.room.controller) {
            if(!creep.pos.isNearTo(creep.room.controller)) {
              creep.moveTo(creep.room.controller, {maxRooms: 1});
            }
            else {
              creep.claimController(creep.room.controller);
            }
          }
          else {
            // ?????
          }
        }
      }
    }
  }

  shouldRun()
  {
    const targetRoom = Game.rooms[this.meta.target];
    if(targetRoom && targetRoom.controller && targetRoom.storage && targetRoom.storage.my) {
      return false;
    }

    return true;
  }
}

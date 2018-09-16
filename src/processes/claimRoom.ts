import {Process} from '../ROS/process'
import {SpawnsHelper} from '../helpers/spawns'

// OS.kernel.addProcess('claimRoom', {room: 'W59S21', target: 'W58S23'}, 0);
export class ClaimRoom extends Process
{


  run()
  {
    // this.meta.target = "W51S32";
    //this.state = 'killed';
    if(this.shouldRun()) {
      // The room from where the creeps are spawned
      const room = Game.rooms[this.meta.room];
      this.handleClaimer(room);
      try {
          this.handleBuilder(room);
      }
      catch(e) {
        console.log("Handle builder failed in claimRoom: " + e.message);
      }
    }
    else {
      this.state = 'killed';
    }
  }

  handleBuilder(room: Room)
  {
    if(!Game.creeps[this.meta.builder]) {
      if(SpawnsHelper.spawnAvailable(room) && room.energyAvailable === room.energyCapacityAvailable) {
        this.meta.builder = SpawnsHelper.spawnCreep(room, [WORK,WORK,WORK,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE], {role: 'claimRoom_builder'}, this.ID.toString());
      }
    }
    else if(Game.creeps[this.meta.builder].spawning) {

    }
    else if(Game.creeps[this.meta.builder]) {
      const creep = Game.creeps[this.meta.builder];
      if(creep.room.name !== this.meta.target) {
        creep.moveTo(new RoomPosition(25,25,this.meta.target), {
          reusePath: 17,
          range: 20,
          costCallback: function(roomName: string, costMatrix: CostMatrix) {
            if(roomName === 'W55S33') {
              return false;
            }

            if(roomName === 'W56S33') {
              costMatrix.set(49,40,255);
              costMatrix.set(49,41,255);
            }

            const sourceKeepersLiar = creep.room.find(FIND_STRUCTURES, {
              filter: (s: Structure) => s.structureType === STRUCTURE_KEEPER_LAIR
            });

            if(sourceKeepersLiar.length) {
              for(let i in sourceKeepersLiar) {
                const sX = sourceKeepersLiar[i].pos.x;
                const sY = sourceKeepersLiar[i].pos.y;
                //costMatrix.set(sX,sY,255);
                // Loop throug Y
                for(let y = (sY - 5), yEnd = (sY + 5); y < yEnd; y++) {
                  for(let x = (sX - 5), xEnd = (sX + 5); x < xEnd; x++) {
                    costMatrix.set(x,y,60);
                    // if(sX !== x && sY !== y) {
                    //   costMatrix.set(x,y,60);
                    // }
                  }
                }
                costMatrix.set(sX,sY,255);
              }
            }

            return costMatrix;
          }
        });
      }
      else {
        if(creep.carry[RESOURCE_ENERGY] === 0) {
          creep.memory.harvesting = true;
        }
        else if(creep.carry[RESOURCE_ENERGY] === creep.carryCapacity) {
          creep.memory.harvesting = false;
        }

        if(creep.memory.harvesting) {

          const source = creep.pos.findClosestByRange(Game.rooms[this.meta.target].sources);

          if(!creep.pos.inRangeTo(source, 2)) {
            creep.moveTo(source);
          }
          else {
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
                const miners = source.pos.findInRange(FIND_MY_CREEPS, 2, {
                  filter: (c: Creep) => c.memory.role === 'miner' && c.getActiveBodyparts(WORK) > 2
                })
                if(!miners.length) {
                  if(creep.harvest(source) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(source);
                  }
                }
                else {
                  // TODO:
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

          if(!Game.rooms[this.meta.target].spawns.length) {

            if(!this.meta.spawnX || !this.meta.spawnY) {
              if(typeof Game.flags[this.meta.target + '_spawn'] !== 'undefined') {
                this.meta.spawnX = Game.flags[this.meta.target + '_spawn'].pos.x;
                this.meta.spawnY = Game.flags[this.meta.target + '_spawn'].pos.y;
                Game.rooms[this.meta.target].createConstructionSite(Game.flags[this.meta.target + '_spawn'].pos.x, Game.flags[this.meta.target + '_spawn'].pos.y, STRUCTURE_RAMPART);
              }
              else {
                const rampartConstructionSites = room.constructionSites.filter((c: ConstructionSite) => c.structureType === STRUCTURE_RAMPART);
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
                  const target = creep.pos.findInRange(Game.rooms[this.meta.target].constructionSites.filter((c: ConstructionSite) => c.structureType === STRUCTURE_RAMPART), 2);
                  if(target.length) {
                    creep.build(target[0]);
                  }
                }
              }
            }
          }
          else { // Spawn is builded
            if(!global.OS.kernel.hasProcessForNameAndMetaKeyValue('room', 'name', this.meta.target)) {
              global.OS.kernel.addProcess('room', {name: this.meta.target}, 0);
            }
            if(Game.rooms[this.meta.target].constructionSites.length) {
                const target = creep.pos.findClosestByRange(Game.rooms[this.meta.target].constructionSites);
                if(!creep.pos.inRangeTo(target, 2)) {
                  creep.moveTo(target);
                }
                else {
                  creep.build(target);
                }
            }
            else {
              if(creep.room.controller) {
                if(!creep.pos.inRangeTo(creep.room.controller, 3)) {
                    creep.moveTo(creep.room.controller);
                }
                else {
                  creep.upgradeController(creep.room.controller);
                }
              }
            }
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
      else if(Game.creeps[this.meta.claimer].spawning) {

      }
      else if(Game.creeps[this.meta.claimer]) {
        const creep = Game.creeps[this.meta.claimer];
        if(creep.room.name !== this.meta.target) {
          creep.moveTo(new RoomPosition(25,25,this.meta.target), {
            reusePath: 17,
            range: 20,
            costCallback: function(roomName: string, costMatrix: CostMatrix) {
              if(roomName === 'W55S33') {
                return false;
              }

              if(roomName === 'W56S33') {
                costMatrix.set(49,40,255);
                costMatrix.set(49,41,255);
              }

              const sourceKeepersLiar = creep.room.find(FIND_STRUCTURES, {
                filter: (s: Structure) => s.structureType === STRUCTURE_KEEPER_LAIR
              });

              if(sourceKeepersLiar.length) {
                for(let i in sourceKeepersLiar) {
                  const sX = sourceKeepersLiar[i].pos.x;
                  const sY = sourceKeepersLiar[i].pos.y;
                  //costMatrix.set(sX,sY,255);
                  // Loop throug Y
                  for(let y = (sY - 5), yEnd = (sY + 5); y < yEnd; y++) {
                    for(let x = (sX - 5), xEnd = (sX + 5); x < xEnd; x++) {
                      costMatrix.set(x,y,60);
                      // if(sX !== x && sY !== y) {
                      //   costMatrix.set(x,y,60);
                      // }
                    }
                  }
                  costMatrix.set(sX,sY,255);
                }
              }

              return costMatrix;
            }
          });
        }
        else {
          if(creep.room.controller) {
            if(!creep.pos.isNearTo(creep.room.controller)) {
              creep.moveTo(creep.room.controller);
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
    if(targetRoom && targetRoom.controller && targetRoom.controller.level > 6) {
      return false;
    }

    return true;
  }
}

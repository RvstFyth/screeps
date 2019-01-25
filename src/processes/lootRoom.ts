import {Process} from '../ROS/process'
import {SpawnsHelper} from '../helpers/spawns'

// META:
// room
// target
// global.OS.kernel.addProcess('lootRoom', {room: 'W4S3', target: "W4S2", creep: '38_30315275'}, 0)
export class LootRoom extends Process
{

    run ()
    {
        // this.state = 'killed';
        // this.meta.target = 'W55S33'
        if(typeof this.meta.doneLooting === 'undefined') {
            this.meta.doneLooting = false;
            this.meta.shouldKill = false;
        }
        if(this.meta.doneLooting) {

        }
        else {
            try {
                this.handleLooter(Game.rooms[this.meta.room]);
            }
            catch(e) {
                this.state = 'killed';
                console.log("HandleLooter failed in the lootRoom process: "+e.message);
            }
        }
    }

    handleLooter(room: Room)
    {
        const creep = Game.creeps[this.meta.creep];
        if(this.meta.shouldKill && !creep) {
            this.state = 'killed';
        }
        else if(!creep) {
            let bodyParts;
            if(room.controller && room.controller.level <= 5) {
                bodyParts = [CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE];
            }
            else {
                bodyParts = [CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE];
            }
            if(SpawnsHelper.spawnAvailable(room)) {
                SpawnsHelper.requestSpawn(this.ID, room, bodyParts,
                    {role: 'looter'}, 'creep'
                );
            }
        }
        else if(creep && creep.spawning) {

        }
        else {
            if(_.sum(creep.carry) === 0) {
                creep.memory.harvesting = true;
            }
            else if(_.sum(creep.carry) === creep.carryCapacity) {
                creep.memory.harvesting = false;
            }
            if(creep.memory.harvesting) {
                if(creep.room.name !== this.meta.target) {
                    creep.moveTo(new RoomPosition(25,25,this.meta.target), {
                      reusePath: 17,
                      range: 20,
                      costCallback: function(roomName: string, costMatrix: CostMatrix) {
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
                              }
                            }
                            costMatrix.set(sX,sY,150);
                          }
                        }

                        return costMatrix;
                      }
                    });
                  }
                else {
                    if(!this.meta.shouldKill) {
                        this.loot(creep);
                    }
                    else {
                        creep.suicide();
                    }
                }
            }
            else {
                this.deliver(creep);
            }
        }
    }

    deliver(creep: Creep)
    {
        if(creep.room.name !== this.meta.room) {
            creep.moveTo(new RoomPosition(25,25,this.meta.room), {
              reusePath: 17,
              range: 10,
              costCallback: function(roomName: string, costMatrix: CostMatrix) {
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
            // Look at area. Check if there is a link within 10 tiles from the exit. Check the entire height/width
            // So we check on a stroke of 49x10
            if(creep.room.storage && !creep.pos.isNearTo(creep.room.storage)) {
                creep.moveTo(creep.room.storage);
            }
            else if(creep.room.storage) {
                const res = creep.transfer(creep.room.storage, _.findKey(creep.carry) as ResourceConstant);
                if(res === ERR_NOT_IN_RANGE) {
                    creep.moveTo(creep.room.storage);
                }
                else if(res === OK) {
                    if(_.sum(creep.room.storage.store) > 900000) {
                        this.meta.shouldKill = true;
                        this.meta.doneLooting = true;
                    }
                }
            }
        }
    }

    loot(creep: Creep)
    {
        if(creep.room.terminal && _.sum(creep.room.terminal.store) > 0) {
            // creep.transfer(creep.room.storage, _.findKey(creep.carry) as ResourceConstant);
            const resource = Object.keys(creep.room.terminal.store).filter(r => r !== RESOURCE_ENERGY)[0] || RESOURCE_ENERGY;

            if(creep.withdraw(creep.room.terminal, resource as ResourceConstant) === ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.terminal);
            }
        }
        else if(creep.room.storage && _.sum(creep.room.storage.store) > 0) {
            if(creep.withdraw(creep.room.storage, _.findKey(creep.room.storage.store) as ResourceConstant) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.storage);
            }
        }
        else {
            const labs = creep.room.labs.filter((l: StructureLab) => l.mineralAmount > 0 || l.energy > 0);
            const tmp = false;
            if(tmp) { //labs.length) {
                const target: StructureLab|null = creep.pos.findClosestByRange(labs);
                if(target) {
                    if(creep.withdraw(target, target.mineralType as ResourceConstant) === ERR_NOT_IN_RANGE) {
                        creep.moveTo(target);
                    }
                }
            }
            else {
                let targets = creep.room.find(FIND_STRUCTURES,
                    {filter: (s: AnyStructure) =>
                        (s.structureType === STRUCTURE_TOWER || s.structureType === STRUCTURE_SPAWN || s.structureType === STRUCTURE_EXTENSION) && s.energy > 0
                });
                if(targets.length) {
                    const target: AnyStructure|null = creep.pos.findClosestByRange(targets);
                    if(target && creep.withdraw(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                        creep.moveTo(target);
                    }
                }
                else {
                    // const nukers: Structure[] = creep.room.find(FIND_STRUCTURES, {
                    //     filter: (s: AnyStructure) => s.structureType === STRUCTURE_NUKER && s.energy > 0
                    // });
                    // if(nukers.length) {
                    //     console.log(creep.withdraw(nukers[0], RESOURCE_ENERGY));
                    //     if(creep.withdraw(nukers[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                    //         creep.moveTo(nukers[0]);
                    //     }
                    // }
                    //else {
                        const containers = creep.room.containers.filter((c: StructureContainer) => _.sum(c.store) > 0);
                        if(containers.length) {
                            const target = creep.pos.findClosestByRange(containers);
                            if(target && creep.withdraw(target, _.findKey(target.store) as ResourceConstant) === ERR_NOT_IN_RANGE) {
                                creep.moveTo(target);
                            }
                        }
                        else {
                            this.meta.shouldKill = true;
                        }
                    //}
                }
            }
        }
    }
}

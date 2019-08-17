export class Worker
{
   static defineTarget(creep: Creep, hasLink: boolean)
   {
     let target,
         targetID;

     creep.memory.targetID = null;
     creep.memory.target = '';

     const assignedTargets = creep.room.find(FIND_MY_CREEPS, {filter: (c: Creep) => c.memory.role === 'worker' || c.memory.role === 'remoteWorker'}).map((c: Creep) => c.memory.targetID);
     // const spawns = creep.room.spawns.filter((s: StructureSpawn) => s.energy < s.energyCapacity && assignedTargets.indexOf(s.id) < 0);
     let spawns: StructureSpawn[] = [];
     for(let s in creep.room.spawns) {
       if(creep.room.spawns[s]. energy < creep.room.spawns[s].energyCapacity) {
         const creepsAssigned = creep.room.find(FIND_MY_CREEPS, {filter: (c: Creep) => c.memory.targetID === creep.room.spawns[s].id});
         if(creepsAssigned.length) {
            const missing = creep.room.spawns[s].energyCapacity - creep.room.spawns[s].energy;
            let assigned = 0;
            for(let c in creepsAssigned) {
              assigned += creepsAssigned[c].carry[RESOURCE_ENERGY];
            }
            if(missing > assigned) {
              spawns.push(creep.room.spawns[s]);
            }
         }
         else {
           spawns.push(creep.room.spawns[s]);
         }
       }
     }
     const transporters = creep.room.find(FIND_MY_CREEPS, {filter: (c: Creep) => c.memory.role === 'transporter'});

     if(!transporters.length && spawns.length && ((creep.room.storage && creep.room.storage.my) || !creep.room.storage)) {
       const t = creep.pos.findClosestByRange(spawns);
       if(t) {
        targetID = t.id;
        target = 'spawn';
       }
     }
     else {
       const extensions = creep.room.extensions.filter((s: StructureExtension) => s.energy < s.energyCapacity && assignedTargets.indexOf(s.id) < 0);
       if(!transporters.length && extensions.length) {
         const t = creep.pos.findClosestByRange(extensions);
         if(t) {
           targetID = t.id;
           target = 'extension';
         }
       }
       else {
         const towers = creep.room.towers.filter((s: StructureTower) => s.energy < s.energyCapacity && assignedTargets.indexOf(s.id) < 0);
         if(!transporters.length && towers.length) {
           const t = creep.pos.findClosestByRange(towers);
           if(t) {
            targetID = t.id;
            target = 'tower';
           }
         }
         else {
           if(typeof creep.room.storage !== 'undefined' && creep.room.storage.my && creep.room.storage.store[RESOURCE_ENERGY] < 500000) {
             const storageCreeps = creep.room.find(FIND_MY_CREEPS, {
               filter: (c: Creep) => c.memory.target === 'storage' || c.memory.role === 'hauler'
             });
             const transporter = creep.room.find(FIND_MY_CREEPS, {
              filter: (c: Creep) => c.memory.target === 'transporter'
             });
             const isRemote = creep.memory.role === 'claimRoom_builder' ;
             if(!hasLink && storageCreeps.length < creep.room.sources.length && (!isRemote || (isRemote && creep.room.storage.store[RESOURCE_ENERGY] < 20000))) {
               target = 'storage';
               targetID = creep.room.storage.id;
             }
             else {
               // Build stuff
               const constructionSites = creep.room.find(FIND_CONSTRUCTION_SITES, {
                  filter: (s: ConstructionSite) => /**s.structureType !== STRUCTURE_WALL && */ s.structureType !== STRUCTURE_RAMPART
               });
               const cs = creep.room.buildTarget;
               if(cs) {
                  targetID = cs.id;
                  target = 'build';
               }
               else {
                 // Repair stuff
                 const damaged = creep.room.find(FIND_STRUCTURES, {
                    filter: (s: Structure) => s.hits < s.hitsMax && s.structureType !== STRUCTURE_WALL && s.structureType !== STRUCTURE_RAMPART && assignedTargets.indexOf(s.id) < 0
                 });
                 if(damaged.length) {
                   const t = creep.pos.findClosestByRange(damaged);
                   if(t) {
                    targetID = t.id;
                    target = 'repair';
                   }
                 }
               }
             }
           }
           else {
             // Build stuff
            //  const constructionSites = creep.room.find(FIND_CONSTRUCTION_SITES, {
            //   filter: (s: ConstructionSite) => /**s.structureType !== STRUCTURE_WALL && */ s.structureType !== STRUCTURE_RAMPART
            //   });
            let cs;
            cs = creep.room.buildTarget;
              if(cs) {
                targetID = cs.id;
                target = 'build';
                // const t = creep.pos.findClosestByRange(constructionSites);
                //   if(t) {
                //     targetID = cs.id;
                //     target = 'build';
                //   }
              }
              else {
                // Repair stuff
                const damaged = creep.room.find(FIND_STRUCTURES, {
                    filter: (s: Structure) => s.hits < s.hitsMax && s.structureType !== STRUCTURE_WALL && s.structureType !== STRUCTURE_RAMPART && assignedTargets.indexOf(s.id) < 0
                });
                if(damaged.length) {
                  const t = creep.pos.findClosestByRange(damaged);
                  if(t) {
                    targetID = t.id;
                    target = 'repair';
                  }
                }
              }
           }
         }
       }
     }

     if(!target && !targetID) {
       if(creep.room.ramparts.length && creep.room.controller && creep.room.controller.level === 8) {
        const t = _.min(creep.room.ramparts, c => c.hits);
        target = 'repair';
        targetID = t.id;
       }
     }

     creep.memory.target = target || 'controller';
     creep.memory.targetID = targetID || 'abc';
   }

  static run(creep: Creep, sourceID: string, linkID: string)
  {
    if(creep.carry[RESOURCE_ENERGY] === 0) {
      creep.memory.harvesting = true;
      creep.memory.targetID = null;
      creep.memory.target = '';
      creep.memory.targetX = 0;
      creep.memory.targetY = 0;
    }
    if(creep.carry[RESOURCE_ENERGY] === creep.carryCapacity) {
      creep.memory.harvesting = false;
    }
    const hasLink = linkID !== '';
    // if(!creep.memory.targetID) {
    //   this.defineTarget(creep);
    // }

    if(creep.memory.harvesting) {
      // if(creep.memory.target === 'controller' && typeof creep.room.storage !== 'undefined' && creep.room.storage.store[RESOURCE_ENERGY] > creep.carryCapacity) {
      //   if(creep.withdraw(creep.room.storage, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
      //     creep.moveTo(creep.room.storage);
      //   }
      //   return;
      // }
      const source: Source|null = Game.getObjectById(sourceID);
      const recycleContainer = creep.room.recycleContainers[0];
      if(recycleContainer && recycleContainer.store[RESOURCE_ENERGY] > 0) {
        if(creep.withdraw(recycleContainer, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
          creep.moveTo(recycleContainer);
        }
      }
      else if(creep.room.storage && creep.room.storage.store[RESOURCE_ENERGY] > 1500) {
        if(!creep.pos.isNearTo(creep.room.storage)) {
          creep.moveTo(creep.room.storage);
        }
        else {

          if(creep.withdraw(creep.room.storage, RESOURCE_ENERGY) === OK) {
            if(!creep.memory.targetID) {
              this.defineTarget(creep, hasLink);
            }
            if(creep.memory.targetID) {
              if(creep.memory.target === 'controller' && creep.room.controller) {
                creep.moveTo(creep.room.controller);
              }
              else {
                const target: AnyStructure|null = Game.getObjectById(creep.memory.targetID);
                if(target) {
                  creep.moveTo(target);
                }
              }
            }
          }
        }
      }
      else if(source) {
        if(!creep.pos.inRangeTo(source, 3)) {
          creep.moveTo(source);
        }
        else {
          const resources = creep.room.find(FIND_DROPPED_RESOURCES, {
            filter: (r: Resource) => r.resourceType === RESOURCE_ENERGY
          });
          const inRange = creep.pos.findInRange(resources, 4);
          if(inRange.length && inRange[0].amount > creep.carryCapacity) {
            if(creep.pickup(inRange[0]) === ERR_NOT_IN_RANGE) {
              creep.moveTo(inRange[0]);
            }
          }
          else {
            let containers, isMining;
            if(creep.room.containers.length) {
              containers = source.pos.findInRange(creep.room.containers, 2).filter((c: StructureContainer) => c.store[RESOURCE_ENERGY] > creep.carryCapacity);
              isMining = containers.length && (creep.pos.x === containers[0].pos.x && creep.pos.y === containers[0].pos.y);// && containers[0].store[RESOURCE_ENERGY] < containers[0].storeCapacity;
            }
            if(containers && containers.length && !isMining) {
              if(creep.withdraw(containers[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                if(creep.withdraw(containers[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                  creep.moveTo(containers[0]);
                }
              }
            }
            else {
              const miners = source.pos.findInRange(FIND_MY_CREEPS, 2, {
                filter: (c: Creep) => c.memory.role === 'miner' && c.getActiveBodyparts(WORK) > 2
              });
              if(!miners.length) {
                const res = creep.harvest(source);
                if(res === ERR_NOT_IN_RANGE) {
                  creep.moveTo(source);
                }
                else if(res === OK) {
                  const containers = source.pos.findInRange(creep.room.containers, 2);
                  if(containers && containers.length) {
                    if((creep.pos.x === containers[0].pos.x && creep.pos.y === containers[0].pos.y) && containers[0].store[RESOURCE_ENERGY] < containers[0].storeCapacity) {
                      creep.drop(RESOURCE_ENERGY);
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    else {
      if(!creep.memory.targetID) {
        this.defineTarget(creep, hasLink);
      }
      if(creep.memory.target === 'controller') {
        if(1 < 1) { //creep.carry[RESOURCE_ENERGY] < (creep.carryCapacity / 4) * 3) {
          this.defineTarget(creep, hasLink);
          this.run(creep, sourceID, linkID);
        }
        if(typeof creep.room.controller !== 'undefined') {
            if(creep.upgradeController(creep.room.controller) === ERR_NOT_IN_RANGE) {
              creep.moveTo(creep.room.controller, {maxRooms:1, range: 3});
            }
          //}
        }
      }
      else {
        if(creep.memory.targetID) {
          const s: any = Game.getObjectById(creep.memory.targetID);
          // For now the targets share the same properties. When this is changed, check on creep.memory.target
          if(creep.memory.target === 'repair') {
            if(s && s.hits === s.hitsMax) {
              this.defineTarget(creep, hasLink);
              this.run(creep, sourceID, linkID);
            }
            const result = creep.repair(s)
            if(s && result === ERR_NOT_IN_RANGE) {
              creep.moveTo(s);
            }
          }
          else if(creep.memory.target === 'build') {
            let c: ConstructionSite|null = Game.getObjectById(creep.memory.targetID);
            if(c) {
              if(creep.build(c) === ERR_NOT_IN_RANGE) {
                creep.moveTo(c);
              }
            }
            else {
              this.defineTarget(creep, hasLink);
              this.run(creep, sourceID, linkID);
            }
          }
          else if(creep.memory.target === 'storage' && typeof creep.room.storage !== 'undefined') {
            if(creep.transfer(creep.room.storage, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
              creep.moveTo(creep.room.storage);
              const extensions: StructureExtension[] = creep.pos.findInRange(creep.room.extensions, 1, {
                filter: (e: StructureExtension) => e.energy < e.energyCapacity
              });
              if(extensions.length) {
                const transporter = creep.room.find(FIND_MY_CREEPS, {
                  filter: (c: Creep) => c.memory.role === 'transporter'
                });
                if(transporter.length) {
                  const filtered = extensions.filter((e: StructureExtension) => e.id !== transporter[0].memory.targetID);
                  if(filtered.length) {
                    creep.transfer(filtered[0], RESOURCE_ENERGY);
                  }
                }
                else {
                  creep.transfer(extensions[0], RESOURCE_ENERGY);
                }
              }
            }
          }
          else {
            if(s && s.energy === s.energyCapacity) {
              this.defineTarget(creep, hasLink);
              this.run(creep, sourceID, linkID);
            }
            if(s && creep.transfer(s, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
              creep.moveTo(s);
            }
          }
        }
      }
    }
  }

  static defineBodyParts(room: Room)
  {
    let bodyParts;

    if(room.energyAvailable <= 300) {
        bodyParts = [WORK, CARRY, MOVE, MOVE];
    }

    else if(room.energyAvailable <= 400) {
        bodyParts = [WORK, CARRY, MOVE, MOVE];
    }
    else if(room.energyAvailable <= 500) {
        bodyParts = [WORK,CARRY,CARRY,MOVE,MOVE,MOVE]; // 350
    }
    else if(room.energyAvailable < 1000) {
      bodyParts = [WORK,WORK,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE];
    }
    else if(room.energyAvailable < 1500) {
        bodyParts = [WORK,WORK,WORK,CARRY,CARRY, CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE];
    }
    else if(room.energyAvailable >= 1500) {
      bodyParts = [WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY, CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE];
    }
    else {
        bodyParts = [WORK,WORK,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE];
    }

    return bodyParts;
  }
}

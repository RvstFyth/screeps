import {Process} from '../ROS/process'
import {StructuresHelper} from '../helpers/structures'
import {BlueprintsHelper} from '../helpers/blueprint'
import { MapHelper } from 'helpers/map';

// OS.kernel.addProcess('room', {name: 'W59S28'}, 0);
export class RoomProcess extends Process
{

  run()
  {
    const room = Game.rooms[this.meta.name];

    if(!room || (room.controller && !room.controller.my)) {
      this.state = 'killed';
      return;
    }

    if(room.name === 'W2N2') {
      StructuresHelper.planRoom(room);
    }

    if(typeof this.meta.publicRamparts === 'undefined') {
      this.meta.publicRamparts = !room.hostiles.length;
    }

    if(room.ramparts.length) {
      if(this.meta.publicRamparts && !room.hostiles.length && !room.ramparts[0].isPublic && Game.cpu.bucket >= 10000 && (!this.meta.rampartTimestamp || this.meta.rampartTimestamp + 100 < Game.time)) {
        _.forEach(room.ramparts, r => r.setPublic(true));
      }
      else if(this.meta.publicRamparts && room.hostiles.length && room.ramparts[0].isPublic) {
        _.forEach(room.ramparts, r => r.setPublic(false));
        this.meta.rampartTimestamp = Game.time;
      }
    }
    if(typeof this.meta.lastHostileCnt === 'undefined'|| (!room.hostiles.length && this.meta.lastHostileCnt !== 0)) {
      if(!room.hostiles.length && this.meta.lastHostileCnt !== 0) {
        console.log(`<span style="color:green">No more hostiles in ${room.name} </span>`);
      }
      this.meta.lastHostileCnt = 0;
    }
    if(room.hostiles.length) {
      if(this.meta.lastHostileCnt === 0 || this.meta.lastHostileCnt !== room.hostiles.length) {
        let extra = room.hostiles.length === room.invaders.length ? '( Invaders )' : room.hostiles[0].owner.username;
        console.log(`<span style="color:orange">Hostile detected in ${room.name} ${extra} | ${room.hostiles.length} total`);
        this.meta.lastHostileCnt = room.hostiles.length;
      }
    }

    if(!global.OS.kernel.hasProcessForNameAndMetaKeyValue('towers', 'room', room.name) && room.towers.length) {
      global.OS.kernel.addProcess('towers', {room: room.name}, this.ID);
    }

    if(!global.OS.kernel.hasProcessForNameAndMetaKeyValue('spawns', 'room', room.name)) {
      global.OS.kernel.addProcess('spawns', {room: room.name}, this.ID);
    }

    if(!this.meta.lastStructureCheck || this.meta.lastStructureCheck < Game.time - 50) {
        // console.log('Triggering checkStructures');
        this.checkStructures(room);
        this.meta.lastStructureCheck = Game.time;
      }

    if(Game.time % 15 === 0) {
      const neighbourRooms = Object.values(Game.map.describeExits(room.name));
        // for (let i of neighbourRooms) {
        //     if (i && !Memory.scoutReports[i] && !MapHelper.isSourceKeeperRoom(i) && !MapHelper.isOwnRoom(i) && !MapHelper.isNeutralRoom(i)) {
        //         if (!global.OS.kernel.hasProcessForNameAndMetaKeyValue('scoutRoom', 'target', i)) {
        //             global.OS.kernel.addProcess('scoutRoom', { room: room.name, target: i }, this.ID);
        //         }
        //     }
        //     else if (i && Memory.scoutReports[i] && Memory.scoutReports[i].owner === '') {
        //         const sourcesIDs = Memory.scoutReports[i].sources;
        //         for (let s of sourcesIDs) {
        //             if (!global.OS.kernel.hasProcessForNameAndMetaKeyValue('remoteMining', 'sourceID', s)) {
        //                 global.OS.kernel.addProcess('remoteMining', { room: room.name, target: i, 'sourceID': s }, this.ID);
        //             }
        //         }
        //     }
        // }
    }

    // Check remotes
    if(Game.time % 10 === 0) {
      // if(Memory.remotes[room.name]) {
      //   for(let target in Memory.remotes[room.name]) {
      //     for(let sourceID of Memory.remotes[room.name][target]) {
      //       if(!global.OS.kernel.hasProcessForNameAndMetaKeyValue('remoteMining', 'sourceID', sourceID)) {
      //         global.OS.kernel.addProcess('remoteMining', {room: room.name, target: target, sourceID: sourceID}, 0)
      //       }
      //     }
      //   }
      // }
  }

    //if(room.controller && room.controller.level > 3) StructuresHelper.planRoom(room);
    // console.log(`Running room ${room.name}`);
    let rcl = room.controller && room.controller.level ? room.controller.level : 0;
    if(Game.shard.name.toLowerCase() === 'shard3') {
      this.meta.support = false;
    }
    if(typeof this.meta.support !== 'undefined' && this.meta.support && !room.storage) {
      return;
    }
    else if (this.meta.support && room.storage) {
      this.meta.support = false;
    }

    if(rcl && rcl <= 8 && !global.OS.kernel.hasProcessForNameAndMetaKeyValue('room_bootstrap', 'room', room.name)) {
      // Bootstrap room. dedicated creeps starts from RCL4
      global.OS.kernel.addProcess('room_bootstrap', {room: room.name}, this.ID);
    }

    if(rcl && rcl >= 3) {
      for(let i in room.sources) {
        if(!global.OS.kernel.hasProcessForNameAndMetaKeyValue('source', 'sourceID', room.sources[i].id)) {
            global.OS.kernel.addProcess('source', {sourceID: room.sources[i].id}, this.ID);
        }
      }
    }

    if(typeof room.storage !== 'undefined' && !global.OS.kernel.hasProcessForNameAndMetaKeyValue('transport', 'room', room.name)) {
      global.OS.kernel.addProcess('transport', {room: room.name}, this.ID);
    }

    if(typeof room.storage !== 'undefined' && !global.OS.kernel.hasProcessForNameAndMetaKeyValue('upgradeRoom', 'room', room.name)) {
      global.OS.kernel.addProcess('upgradeRoom', {room: room.name}, this.ID);
    }

    if(rcl && rcl >= 5) {
      if(rcl > 5 && !global.OS.kernel.hasProcessForNameAndMetaKeyValue('mineral', 'room', room.name)) {
        global.OS.kernel.addProcess('mineral', {room: room.name}, this.ID);
      }
      if(!global.OS.kernel.hasProcessForNameAndMetaKeyValue('repairRoom', 'room', room.name)) {
        global.OS.kernel.addProcess('repairRoom', {room: room.name}, this.ID);
      }
    }

    if(room.links.length && !global.OS.kernel.hasProcessForNameAndMetaKeyValue('links', 'room', room.name)) {
      global.OS.kernel.addProcess('links', {room: room.name}, this.ID);
    }

    if(!this.meta.lastStructureCheck || this.meta.lastStructureCheck < Game.time - 50) {
      // console.log('Triggering checkStructures');
      this.checkStructures(room);
      this.meta.lastStructureCheck = Game.time;
    }

    if(room.name === 'W12N19' && room.controller && room.controller.level >= 6 && room.storage && room.terminal && room.labs.length > 2) {
      if(!global.OS.kernel.hasProcessForNameAndMetaKeyValue('handleLabs', 'room', room.name)) {
          global.OS.kernel.addProcess('handleLabs', {room: 'W12N19'}, 0)
      }
    }

    if(room.storage && room.terminal) {
      if(!global.OS.kernel.hasProcessForNameAndMetaKeyValue('resources', 'room', room.name)) {
        global.OS.kernel.addProcess('resources', {room: room.name}, this.ID);
      }
    }

    if(room.controller && room.controller.level > 6) {
      if(!global.OS.kernel.hasProcessForNameAndMetaKeyValue('defence', 'room', room.name)) {
        global.OS.kernel.addProcess('defence', {room: room.name}, this.ID);
      }
    }

    if(room.controller && room.spawns.length) {
      for(let i = 0, iEnd = room.spawns.length; i < iEnd; i++) {
        if(room.spawns[i].hits < room.spawns[i].hitsMax) {
          room.controller.activateSafeMode();
          console.log(`Actived safemode for room ${room.name}`);
        }
      }
    }

    if(room.powerSpawn && !global.OS.kernel.hasProcessForNameAndMetaKeyValue('processPower', 'room', room.name)) {
      global.OS.kernel.addProcess('processPower', {room: room.name}, this.ID);
    }

    if(room.storage && room.controller && room.controller.level === 8 && room.storage.store[RESOURCE_ENERGY] >= 150000) {
      try {
        if(!global.OS.kernel.hasProcessForNameAndMetaKeyValue('sendResources', 'room', room.name)) {
          let rooms: any[] = [];

          for(let n in Game.rooms) {
            const tr = Game.rooms[n];
            if(tr.controller && tr.controller.my && tr.storage && tr.terminal && tr.terminal.my && !global.OS.kernel.hasProcessForNameAndMetaKeyValue('sendResources', 'target', tr.name) &&!global.OS.kernel.hasProcessForNameAndMetaKeyValue('haulResources', 'room', tr.name)) {
              rooms.push(tr);
            }
          }

          if(rooms.length) {
            const roomsBelow = rooms.filter((r: any) => r.controller && r.controller.level < 8);
            let targets;
            if(roomsBelow.length) {
              targets = roomsBelow;
            }
            else {
              targets = rooms;
            }
            const target = _.min(rooms, r => r.storage.store[RESOURCE_ENERGY]);
            if(room.storage.store[RESOURCE_ENERGY] > target.storage.store[RESOURCE_ENERGY] * 1.5) {
              let amount = 20000;
              if(room.storage.store[RESOURCE_ENERGY] > 250000) amount = 50000;
              else if(room.storage.store[RESOURCE_ENERGY] > 200000) amount = 30000;
              global.OS.kernel.addProcess('sendResources', {room: room.name, target: target.name, resource: RESOURCE_ENERGY, amount: amount}, 0);
            }
          }
        }
      }
      catch(e) {
        console.log(`Error in roomProcess sending resources: ${e.message}`);
      }
    }
  }

  checkStructures(room: Room)
  {
    if(room.memory.blueprintKey && room.memory.blueprintType && room.memory.centerX && room.memory.centerY) {
        this.fromBlueprint(room);
    }
    // console.log(`Triggered checkStructures for ${room.name}`)
    if(typeof room.controller !== 'undefined') {
        if(room.controller.level >= 3) {
          StructuresHelper.placeContainerNearSources(room);
        }
        if(room.controller.level >= 6) {
          try {
            StructuresHelper.rampartImportantStructures(room);
            const tiles: RoomPosition[] = StructuresHelper.defineUpgraderSpots(room, 1);
            for(let i in tiles) {
              if(!tiles[i].lookFor(LOOK_STRUCTURES).filter((s: Structure) => s.structureType === STRUCTURE_RAMPART).length) {
                tiles[i].createConstructionSite(STRUCTURE_RAMPART);
              }
            }
          }
          catch(e) {
            console.log(`Bug while placing ramparts around the controller ${JSON.stringify(e)}`);
          }
        }
    }
  }

  fromBlueprint(room: Room)
  {
    if(room.memory.blueprintKey && room.memory.blueprintType && room.memory.centerX && room.memory.centerY && room.controller) {
        const uniqueStructures = BlueprintsHelper.getStructureTypesForBlueprint(room.memory.blueprintType, room.memory.blueprintKey);
        if (uniqueStructures && uniqueStructures.length) {
            for (let s of uniqueStructures) {
                if (!room.storage && s === STRUCTURE_CONTAINER) continue;
                if ((s === STRUCTURE_ROAD || s === STRUCTURE_RAMPART)) continue;
                const t: StructureConstant = s as BuildableStructureConstant;
                const max: number = CONTROLLER_STRUCTURES[t][room.controller.level];
                const existingStructures = room.find(FIND_STRUCTURES, { filter: (s: Structure) => s.structureType === t });
                if (max === existingStructures.length) continue;

                const positions = BlueprintsHelper.getPositionsForConstructionSitesForRCL(t, 'bunkers', '1', room.controller.level, room.memory.centerX, room.memory.centerY);
                // Loop through positions and see which are missing and build them!
                for (let p of positions) {
                    if (!room.lookForAt(LOOK_STRUCTURES, p.x, p.y).filter((s: Structure) => s.structureType === t).length) {
                        room.createConstructionSite(p.x, p.y, t);
                    }
                }
            }
        }

        // Inner roads
        if ((room.controller.level > 6 && room.controller.progress > (room.controller.progressTotal / 2)) || room.controller.level > 7 && Game.time % 150 === 0) {
            const roadPositions = BlueprintsHelper.getPositionsForConstructionSitesForRCL(STRUCTURE_ROAD, 'bunkers', '1', room.controller.level, room.memory.centerX, room.memory.centerY);
            for (let p of roadPositions) {
                if (!room.lookForAt(LOOK_STRUCTURES, p.x, p.y).filter((s: Structure) => s.structureType === STRUCTURE_ROAD).length) {
                    room.createConstructionSite(p.x, p.y, STRUCTURE_ROAD);
                }
            }
        }

        // Ramparts
        if (room.ramparts.length) {
            const lowest = _.min(room.ramparts, r => r.hits);
            if (lowest.hits < 25000) return;
        }
        const constructionSites = room.find(FIND_CONSTRUCTION_SITES, { filter: (c: ConstructionSite) => c.structureType === STRUCTURE_RAMPART });
        if (constructionSites.length || !room.storage) return;

        const rampartSpots = BlueprintsHelper.getPositionsForConstructionSitesForRCL(STRUCTURE_RAMPART, 'bunkers', '1', room.controller.level, room.memory.centerX, room.memory.centerY);
        for (let p of rampartSpots) {
            if (!room.lookForAt(LOOK_STRUCTURES, p.x, p.y).filter((s: Structure) => s.structureType === STRUCTURE_RAMPART).length) {
                room.createConstructionSite(p.x, p.y, STRUCTURE_RAMPART);
                return;
            }
        }
    }
  }
}

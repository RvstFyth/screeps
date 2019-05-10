import {Process} from '../ROS/process'
import {StructuresHelper} from '../helpers/structures'

// OS.kernel.addProcess('room', {name: 'W59S28'}, 0);
export class Room extends Process
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

    if(room.controller && room.controller.level >= 6 && room.storage && room.terminal && room.labs.length > 2) {
      if(!global.OS.kernel.hasProcessForNameAndMetaKeyValue('autoMakeBoosts', 'room', room.name)) {
        global.OS.kernel.addProcess('autoMakeBoosts', {room: room.name}, this.ID);
      }
    }

    if(room.storage && room.terminal) {
      if(!global.OS.kernel.hasProcessForNameAndMetaKeyValue('resources', 'room', room.name)) {
        global.OS.kernel.addProcess('resources', {room: room.name}, this.ID);
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
            if(tr.controller && tr.controller.my && tr.controller.level < 8 && tr.storage && tr.terminal && tr.terminal.my && !global.OS.kernel.hasProcessForNameAndMetaKeyValue('haulResources', 'room', tr.name)) {
              rooms.push(tr);
            }
          }

          if(rooms.length) {
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

  checkStructures(room: any)
  {
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
}

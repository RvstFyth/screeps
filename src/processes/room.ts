import {Process} from '../ROS/process'
import {StructuresHelper} from '../helpers/structures'

// OS.kernel.addProcess('room', {name: 'W59S28'}, 0);
export class Room extends Process
{

  run()
  {
    if(!Game.rooms[this.meta.name]) {
      this.state = 'killed';
      return;
    }

    const room = Game.rooms[this.meta.name];
    if(typeof this.meta.publicRamparts === 'undefined') {
      this.meta.publicRamparts = !room.hostiles.length;
    }

    if(room.ramparts.length) {
      if(this.meta.publicRamparts && !room.hostiles.length && !room.ramparts[0].isPublic) {
        _.forEach(room.ramparts, r => r.setPublic(true));
      }
      else if(this.meta.publicRamparts && room.hostiles.length && room.ramparts[0].isPublic) {
        let cpu = Game.cpu.getUsed();
        _.forEach(room.ramparts, r => r.setPublic(false));
        console.log(`<span style="color:orange">Hostile detected in ${room.name}, closing ramparts took ${Game.cpu.getUsed() - cpu} CPU`);
      }
    }

    //if(room.controller && room.controller.level > 3) StructuresHelper.planRoom(room);
    // console.log(`Running room ${room.name}`);
    let rcl = room.controller && room.controller.level ? room.controller.level : 0;

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

    if(!global.OS.kernel.hasProcessForNameAndMetaKeyValue('spawns', 'room', room.name)) {
      global.OS.kernel.addProcess('spawns', {room: room.name}, this.ID);
    }

    if(typeof room.storage !== 'undefined' && !global.OS.kernel.hasProcessForNameAndMetaKeyValue('transport', 'room', room.name)) {
      global.OS.kernel.addProcess('transport', {room: room.name}, this.ID);
    }

    if(typeof room.storage !== 'undefined' && !global.OS.kernel.hasProcessForNameAndMetaKeyValue('upgradeRoom', 'room', room.name)) {
      global.OS.kernel.addProcess('upgradeRoom', {room: room.name}, this.ID);
    }

    if(!global.OS.kernel.hasProcessForNameAndMetaKeyValue('towers', 'room', room.name) && room.towers.length) {
      global.OS.kernel.addProcess('towers', {room: room.name}, this.ID);
    }

    if(rcl && rcl >= 5) {
      if(rcl > 6 && !global.OS.kernel.hasProcessForNameAndMetaKeyValue('mineral', 'room', room.name)) {
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
      console.log('Triggering checkStructures');
      this.checkStructures(room);
      this.meta.lastStructureCheck = Game.time;
    }
  }

  checkStructures(room: any)
  {
    if(typeof room.controller !== 'undefined') {
        if(room.controller.level >= 3) {
          StructuresHelper.placeContainerNearSources(room);
        }
    }
  }
}
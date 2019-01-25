import {Process} from '../ROS/process'
import {SpawnsHelper} from '../helpers/spawns'
import {Scout} from '../roles/scout'

// OS.kernel.addProcess('scoutRoom', {room: 'W4S3', target: 'W4S2'}, 0);
export class ScoutRoom extends Process
{
  run()
  {
    //this.state = 'killed';
    // this.meta.target = 'W4S2';
    const creep = Game.creeps[this.meta.scout];
    const room = Game.rooms[this.meta.room];
    if(!creep) {
      if(SpawnsHelper.spawnAvailable(Game.rooms[this.meta.room])) {
        this.meta.scout = SpawnsHelper.spawnCreep(Game.rooms[this.meta.room], [MOVE], {role: 'scout'}, this.ID.toString())
      }
    }
    else if(creep && creep.spawning) {

    }
    else if(creep) {
      if(creep.room.name !== this.meta.target) {
        creep.moveToRoom(this.meta.target, true);
      }
      else {
        if(!Memory.scoutReports[this.meta.target] || (Memory.scoutReports[this.meta.target] && Game.time - Memory.scoutReports[this.meta.target].time > 100)) {
          Memory.scoutReports[this.meta.target] = {
            time: Game.time,
            owner: creep.room.controller ? creep.room.controller.owner : '',
            sources: creep.room.find(FIND_SOURCES),
            mineral: creep.room.find(FIND_MINERALS)[0].mineralType
          }
        }
        if(room && room.storage && room.storage.my && (creep.room.storage && _.sum(creep.room.storage.store) > 1000) || creep.room.terminal && _.sum(creep.room.terminal.store) > 1000) {
          if(creep.room.storage && !global.OS.kernel.hasProcessForNameAndMetaKeyValue('lootRoom', 'target', creep.room.name)) {
            const path = creep.room.findPath(creep.pos, creep.room.storage.pos);
            if(path && path.length) {
              const amountToLoot = (creep.room.storage ? _.sum(creep.room.storage.store) : 0) + (creep.room.terminal ? _.sum(creep.room.terminal.store) : 0);
              let looters = Math.floor(amountToLoot / 10000);
              if(looters === 0) looters = 1;
              else if(looters > 4) looters = 4;
              for(let i = 0; i < looters; i++) {
                global.OS.kernel.addProcess('lootRoom', {room: this.meta.room, target: creep.room.name}, 0);
              }
            }
          }
        }

        creep.suicide();
        this.state = 'killed';
      }
    }
  }
}

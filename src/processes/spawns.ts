import {Process} from '../ROS/process'
import {SpawnsHelper} from '../helpers/spawns'

/**
 * const spawnEntry = {
 *   pID: process.ID
 *   mKey: process.meta[mKey]    // Where to save the creep name
 *   memory: {role: 'miner'}
 *   bodyParts: [WORK,WORK,MOVE]
 *   room: "W56S33"
 * }
 *
 */
export class Spawns extends Process
{

  run()
  {
    if(!Memory.spawnQueue[this.meta.room]) {
      Memory.spawnQueue[this.meta.room] = [];
    }
    let room: Room|undefined = Game.rooms[this.meta.room];
    if(!room || !room.controller || !room.controller.my) {
      room = undefined;
    }
    if(room && Memory.spawnQueue[this.meta.room].length) {
      if(SpawnsHelper.spawnAvailable(room)) {
        const req = this.getNextSpawn(room, Memory.spawnQueue[this.meta.room]);
        if(req) {
          let name = SpawnsHelper.spawnCreep(room, req.body, req.memory, req.pID.toString());
          if(name) {
            const requestingProcess = global.OS.kernel.getProcessForID(req.pID);
            if(requestingProcess) {
              // set mKey for requestingProcess
              if(req.mKey[req.mKey.length - 1] === ']') { // means we need to push to array
                requestingProcess.meta[req.mKey.replace('[]', '')].push(name);
                // Game.rooms["W31S21"].find(FIND_MY_CREEPS).forEach(c => c.suicide());
              }
              else {
                requestingProcess.meta[req.mKey] = name;
              }
              for(let i = 0, iEnd = Memory.spawnQueue[this.meta.room].length; i < iEnd; i++) {
                if(Memory.spawnQueue[this.meta.room][i] === req) {
                  Memory.spawnQueue[this.meta.room][i] = null;
                }
              }
            }
          }
        }
      }
    }
    else if(!room){
      this.state = 'killed';
    }

    Memory.spawnQueue[this.meta.room] = [];
  }

  getNextSpawn(room: Room, entries: any[])
  {
    const sorted = _.groupBy(entries, e => e.memory.role);
    if(room.storage && room.storage.store[RESOURCE_ENERGY] > 20000) {
      if(sorted['transporter'] && sorted['transporter'].length) {
        return sorted['transporter'][0];
      }
    }
    if(sorted['miner'] && sorted['miner'].length) {
      return sorted['miner'][0];
    }
    if(sorted['hauler'] && sorted['hauler'].length) {
      return sorted['hauler'][0];
    }
    if(room.controller && room.controller.level < 4 && sorted['worker'] && sorted['worker'].length) {
      return sorted['worker'][0];
    }
    if(sorted['upgrader'] && sorted['upgrader'].length) {
      return sorted['upgrader'][0];
    }
    if(sorted['worker'] && sorted['worker'].length) {
      return sorted['worker'][0];
    }

    return entries.shift();
  }
}

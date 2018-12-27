import { ErrorMapper } from "utils/ErrorMapper";
import { ROS } from "ROS/ROS";
import {PathingHelper} from 'helpers/pathing'
import 'prototypes/Room';
import 'prototypes/Creep';
import 'prototypes/RoomObject';
import 'prototypes/StructureLab';
import 'prototypes/RoomVisual';
import 'globals';
// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code

PathingHelper.initialize();
const OS = new ROS();

global.OS = OS;
//catalyzed zynthium alkalide
// sendResources(RESOURCE_CATALYZED_ZYNTHIUM_ALKALIDE, "W56S33", "W59S21", 3000);
global.sendResources = function(type: ResourceConstant, roomName: string, target: string, amount: number)
{
  if(Game.rooms[roomName]) {
    const room: Room = Game.rooms[roomName];
    const terminal = room.find(FIND_STRUCTURES, {filter: (s: any) => s.structureType === STRUCTURE_TERMINAL})[0] as StructureTerminal;
    if(terminal && terminal.store[type]) {
      terminal.send(type, amount, target);
    }
  }
}

if(!Memory.remotes) {
  Memory.remotes = {};
}

if(!Memory.cpu) {
  Memory.cpu = {
    used: 0,
    cnt: 0,
    last: 0
  }
}

export const loop = ErrorMapper.wrapLoop(() => {
  let cpu = Game.cpu.getUsed();
  global.populateLOANlist();
  OS.run();
  const cpuUsed = Game.cpu.getUsed() - cpu;
  if(Game.time % 20 === 0) {
    // console.log(`${Game.shard.name} | Tick: ${Game.time} | CPU: ${cpuUsed.toFixed(2)} | ${Object.keys(Game.rooms).length} rooms in vision | ${Memory.ROS.processes.length} processes in mem`);
  }
  // Automatically delete memory of missing creeps

  if(Memory.cpu.cnt === 100) {
    Memory.cpu.last = Memory.cpu.used / Memory.cpu.cnt;
    Memory.cpu.used = cpuUsed;
    Memory.cpu.cnt = 1;
  }
  else {
    Memory.cpu.used += cpuUsed;
    Memory.cpu.cnt++;
  }

  for (const name in Memory.creeps) {
    if (!(name in Game.creeps)) {
      delete Memory.creeps[name];
    }
  }
});

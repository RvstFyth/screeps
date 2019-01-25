import { ErrorMapper } from "utils/ErrorMapper";
import { ROS } from "ROS/ROS";
import {PathingHelper} from 'helpers/pathing'
import 'prototypes/Room';
import 'prototypes/Creep';
import 'prototypes/RoomObject';
import 'prototypes/StructureLab';
import 'prototypes/RoomVisual';
import 'prototypes/Source';
import 'prototypes/StructureController';
import 'globals';
// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code

if(!Memory.stats){ Memory.stats = {} }

PathingHelper.initialize();
const OS = new ROS();
global.cache = {}
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

console.log(`Starting a new global on ${Game.shard.name}`);

if(!Memory.scoutReports) {
  Memory.scoutReports = {};
}
if(!Memory.attackedRemotes) {
  Memory.attackedRemotes = {};
}

export const loop = ErrorMapper.wrapLoop(() => {
  Memory.triggeredConstruction = false;
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

  const lastGCL = Memory.stats['gcl.'+Game.shard.name+'.progress'];
  Memory.stats['gcl.'+Game.shard.name+'.tick'] = Game.gcl.progress - lastGCL > 0 ? Game.gcl.progress - lastGCL : Game.gcl.progress;

  Memory.stats['cpu.'+Game.shard.name+'.getUsed'] = Game.cpu.getUsed()
  Memory.stats['cpu.'+Game.shard.name+'.limit'] = Game.cpu.limit
  Memory.stats['cpu.'+Game.shard.name+'.bucket'] = Game.cpu.bucket
  Memory.stats['gcl.'+Game.shard.name+'.progress'] = Game.gcl.progress
  Memory.stats['gcl.'+Game.shard.name+'.progressTotal'] = Game.gcl.progressTotal
  Memory.stats['gcl.'+Game.shard.name+'.level'] = Game.gcl.level
  Memory.stats['creepCount'] = undefined;
  Memory.stats['creepCnt.'+Game.shard.name] = Object.keys(Game.creeps).length;

  try {
    RawMemory.segments[99] = JSON.stringify(Memory.stats);
  }
  catch(e) {
    console.log(`Failed to push stats to segment!`);
  }
});

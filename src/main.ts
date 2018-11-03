import { ErrorMapper } from "utils/ErrorMapper";
import { ROS } from "ROS/ROS";
import {PathingHelper} from 'helpers/pathing'
import 'prototypes/Room';
import 'prototypes/Creep';
import 'prototypes/RoomObject';
import 'globals'
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

global.test = function()
{
  const iterations = 10;
  const cpuA = Game.cpu.getUsed();

  for(let i = 0, iEnd = iterations; i < iEnd; i++) {
    const a = _.values(Game.creeps);
  }
  const usedA = Game.cpu.getUsed() - cpuA;

  const cpuB = Game.cpu.getUsed();
  for(let i = 0, iEnd = iterations; i < iEnd; i++) {
    const b = Object.values(Game.creeps);
  }
  const usedB = Game.cpu.getUsed() - cpuB;

  console.log(`${iterations}x Lodash: ${usedA.toFixed(3)} (${(usedA / iterations).toFixed(5)}) | Native: ${usedB.toFixed(3)} (${(usedB / iterations).toFixed(5)})`);
}

if(!Memory.remotes) {
  Memory.remotes = {};
}

export const loop = ErrorMapper.wrapLoop(() => {
  let cpu = Game.cpu.getUsed();
  global.populateLOANlist();
  OS.run();
  //if(Game.time % 5 === 0) {
    console.log(`Tick: ${Game.time} | CPU: ${(Game.cpu.getUsed() - cpu).toFixed(2)} | ${Object.keys(Game.rooms).length} rooms in vision | ${Memory.ROS.processes.length} processes in mem`);
  //}
  // Automatically delete memory of missing creeps
  for (const name in Memory.creeps) {
    if (!(name in Game.creeps)) {
      delete Memory.creeps[name];
    }
  }
});

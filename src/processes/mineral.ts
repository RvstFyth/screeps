import {Process} from '../ROS/process'
import {SpawnsHelper} from '../helpers/spawns'
import {MineralMiner} from '../roles/mineralMiner'
import {MineralHauler} from '../roles/mineralHauler'
import { CreepsHelper } from 'helpers/creeps';
import { Miner } from 'roles/miner';

export class Mineral extends Process
{


  run()
  {
    const room = Game.rooms[this.meta.room];
    if(!room || !room.controller || !room.controller.my) {
      this.state = 'killed';
    }
    const mineral = room.find(FIND_MINERALS)[0];
    const extractor = room.find(FIND_STRUCTURES, {
      filter: (s: Structure) => s.structureType === STRUCTURE_EXTRACTOR
    });
    if(typeof this.meta.mineralType === 'undefined') {
      this.meta.mineralType = mineral.mineralType;
    }
    if(!extractor.length) {
      const constructionSites = room.constructionSites.filter((s: ConstructionSite) => s.structureType === STRUCTURE_EXTRACTOR);
      if(!constructionSites.length) {
        if(mineral) {
          room.createConstructionSite(mineral.pos.x, mineral.pos.y, STRUCTURE_EXTRACTOR);
        }
      }
    }
    else {
      // try {
      //   if(room.storage && !global.OS.kernel.hasProcessForNameAndMetaKeyValue('sendResources', 'room', this.meta.room)) {
      //     for(let n in room.storage.store) {
      //       if(n == RESOURCE_ENERGY) {
      //         continue;
      //       }
      //       const storageAmount = room.storage ? (room.storage.store as any)[n] : null;
      //       if(storageAmount && storageAmount > 20000) { // over 30k send to other rooms that can use them
      //         //if(!global.OS.kernel.hasProcessForNameAndMetaKeyValue('sendResources', 'room', this.meta.room)) {
      //           if(this.sendResourcesToOtherRooms(n as MineralConstant)) {
      //             break;
      //           }
      //           else {
      //             continue;
      //           }
      //       }
      //     }
      //   }
      // }
      // catch(e) {
      //   console.log("resource management failed");
      // }

      const storageAmount = room.storage ? room.storage.store[mineral.mineralType] : null;
      const terminalAmount = room.terminal ? room.terminal.store[mineral.mineralType] : null;
      const sellTreshould = 300000; // replace with a constant

      if(storageAmount && storageAmount > sellTreshould) {
        if(storageAmount && storageAmount > (sellTreshould + 10000)) {
          const amount = storageAmount - (sellTreshould + 10000);
          if(amount > 10000 && !global.OS.kernel.hasProcessForNameAndMetaKeyValue('sellResources', 'room', room.name)) {
            global.OS.kernel.addProcess('sellResources', {room: room.name, resourceType: mineral.mineralType, amount: amount}, 0);
          }
        }
      }

      if(!this.meta.miningSpots) {
        try {
          const x = mineral.pos.x;
          const y = mineral.pos.y;
          let cnt = 0;
          const tiles = room.lookForAtArea(LOOK_TERRAIN,y -1, x - 1, y + 1, x + 1, true);
          for(let i = 0, iEnd = tiles.length; i < iEnd; i++) {
            if(tiles[i].x === x && tiles[i].y === y) continue;
            if(tiles[i].terrain !== 'wall') {
              cnt++;
            }
          }
          this.meta.miningSpots = cnt;
        }
        catch(e) {}
      }
      // else {
      //   mineral.say(`${this.meta.miningSpots} spots`);
      // }

      //if(mineral.mineralAmount > 0) {
        try {
          //if(!storageAmount || storageAmount < 200000) {
            const canSpawn = mineral.mineralAmount > 0 && ((!storageAmount || storageAmount < 200000) || (!terminalAmount || terminalAmount < 30000));
            this.handleMiners(canSpawn);
          //}
          //else {
            // Start selling resources!!
          //}
        }
        catch(e) {
          console.log("HandleMiner crashed: "+e.message);
        }
      //}
      try {
        this.handleHauler(room, mineral.pos.x, mineral.pos.y);
      }
      catch(e) {
        console.log("HandleHauler crashed: "+e.message);
      }
    }
  }

  sendResourcesToOtherRooms(mineral: MineralConstant)
  {
    let room;
    let success = false;
    for(let n in Game.rooms) {
      room = Game.rooms[n];
      if(room.controller && room.controller.my) {
        if(room.terminal && room.storage) {
          const r = mineral;
          const amountInRoom = (room.storage.store[r] || 0) + (room.terminal.store[r] || 0);

          if(amountInRoom < 5000) {
            if(!global.OS.kernel.hasProcessForNameAndMetaKeyValue('sendResources', 'target', room.name)) {
              success = true;
              global.OS.kernel.addProcess('sendResources', {room: this.meta.room, target: room.name, resource: mineral, amount: 5000}, 0);
              break;
            }
          }
        }
      }
    }
    return success;
  }

  handleHauler(room: Room, mineralX: number, mineralY: number)
  {
    if(!this.meta.haulerX || !this.meta.haulerY) {
      const containers: StructureContainer[] = new RoomPosition(mineralX, mineralY, room.name).findInRange(room.containers, 1);
      if(containers.length) {
        this.meta.haulerX = containers[0].pos.x;
        this.meta.haulerY = containers[0].pos.y;
        this.meta.haulerTarget = containers[0].id;
      }
      else {
        //return false;
      }
    }
    if(this.meta.haulerX && this.meta.haulerY) {
      const target: StructureContainer|null = Game.getObjectById(this.meta.haulerTarget);
      if(target && _.sum(target.store) === target.storeCapacity && (!this.meta.hauler || !Game.creeps[this.meta.hauler])) {
        if(SpawnsHelper.spawnAvailable(room)) {
          SpawnsHelper.requestSpawn(this.ID, room, [CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE], {role: 'mineralHauler'}, 'hauler');
        }
      }
      else if(Game.creeps[this.meta.hauler] && Game.creeps[this.meta.hauler].spawning) {

      }
      else if(Game.creeps[this.meta.hauler]) {
        const creep = Game.creeps[this.meta.hauler];
        if(!creep.memory.target) {
          creep.memory.target = this.meta.haulerTarget;
          creep.memory.targetX = this.meta.haulerX;
          creep.memory.targetY = this.meta.haulerY;
        }
        MineralHauler.run(creep);
      }
    }
  }

  handleMiners(canSpawn: boolean)
  {
    const room = Game.rooms[this.meta.room];
    let numMiners = 1;

    if(this.meta.miningSpots && room.storage && room.spawns.length > 1) {
      numMiners += Math.floor(room.storage.store[RESOURCE_ENERGY] / 50000);
      if(numMiners > this.meta.miningSpots) {
        numMiners = this.meta.miningSpots;
      }
    }

    if(!this.meta.miners) {
      this.meta.miners = [];
    }

    let spawningCreeps = 0;

    for(let i = 0, iEnd = this.meta.miners.length; i < iEnd; i++) {
      if(!Game.creeps[this.meta.miners[i]]) {
        this.meta.miners[i] = null;
      }
      else if(Game.creeps[this.meta.miners[i]] && Game.creeps[this.meta.miners[i]].spawning) {
        spawningCreeps++;
      }
      else if(Game.creeps[this.meta.miners[i]]) {
        MineralMiner.run(Game.creeps[this.meta.miners[i]]);
      }
    }

    this.meta.miners = this.meta.miners.filter((n: any) => n); // Remove NULL values
    const amountInStorage = room.storage ? room.storage.store[RESOURCE_ENERGY] : 0;
    if(amountInStorage > 50000 && canSpawn && spawningCreeps === 0 && this.meta.miners.length < numMiners) {
      if(SpawnsHelper.spawnAvailable(Game.rooms[this.meta.room])) {
        SpawnsHelper.requestSpawn(this.ID, Game.rooms[this.meta.room], MineralMiner.defineBodyParts(Game.rooms[this.meta.room]), {role: 'mineralMiner'}, 'miners[]');
      }
    }
  }
}

import {Process} from '../ROS/process'
import {SpawnsHelper} from '../helpers/spawns'
import {RemoteMiner} from '../roles/remoteMiner'
import {RemoteHauler} from '../roles/remoteHauler'
import {StructuresHelper} from '../helpers/structures'
import {PathingHelper} from '../helpers/pathing'
import {Worker} from '../roles/worker';

// META:
// room
// target
// sourceID
// global.OS.kernel.addProcess('remoteMining', {room: 'W58S23', target: 'W59S23', sourceID: '59bbc4192052a716c3ce75b5'}, 0)
export class RemoteMining extends Process
{
  initRoom(source: Source, mainRoom: Room)
  {
    if(mainRoom.storage) {
      const path = source.room.findPath( source.pos, mainRoom.storage.pos, {
        ignoreCreeps: true,
        ignoreDestructibleStructures: true,
        costCallback: function(roomName, costMatrix) {

          const room = Game.rooms[roomName];
          if(room && room.sources.length) {
              for(let i in room.sources) {
                const sx = room.sources[i].pos.x;
                const sy = room.sources[i].pos.y;

                for(let y = (sy - 1), yEnd = (sy + 2); y < yEnd; y++) {
                  for(let x = (sx - 1), xEnd = (sx + 2); x < xEnd; x++) {
                    costMatrix.set(x,y,180);
                  }
                }
                for(let w in room.walls) {
                  costMatrix.set(room.walls[w].pos.x, room.walls[w].pos.y, 255);
                }
              }
          }

          return true;
        }
      });
      this.meta.roads = PathingHelper.pathToString(path);
    }
  }

  checkRoads(room: Room)
  {
    const path = PathingHelper.stringToPath(this.meta.roads);
    for(let i in path) {
        const terrain = room.lookForAt(LOOK_TERRAIN, path[i].x, path[i].y);
        if(terrain && terrain.length) {
          if(terrain[0] !== 'wall') {
            // room.createConstructionSite(path[i].x, path[i].y, STRUCTURE_ROAD);
          }
        }
        // room.visual.circle(path[i].x, path[i].y, {
        //   stroke: 'orange'
        // })
    }
  }

  run()
  {
    if(this.meta.room === 'W5N3' && (this.meta.target === 'W5N4' || this.meta.target === 'W6N3')) {
      this.state = 'killed';
    }
    const room = Game.rooms[this.meta.room];
    const source: Source|null = Game.getObjectById(this.meta.sourceID);
    if(this.suspendedTill && this.suspendedTill > 0 && Game.time < this.suspendedTill) {
      if(Memory.attackedRemotes[this.meta.target] && Game.rooms[this.meta.target]) {
        const hostiles = Game.rooms[this.meta.target].hostiles.filter((c: Creep) => c.getActiveBodyparts(ATTACK) || c.getActiveBodyparts(HEAL) || c.getActiveBodyparts(RANGED_ATTACK));
        if(Game.rooms[this.meta.target] && !hostiles.length) {
          Memory.attackedRemotes[this.meta.target] = undefined;
          this.suspendedTill = 0;
        }
        return;
      }
    }
    else {
      this.suspendedTill = 0;
      Memory.attackedRemotes[this.meta.target] = undefined;
    }

    if(!this.meta.roads) {
      if(source) {
        this.initRoom(source, room);
      }
    }
    try {
      if(!Memory.remotes[this.meta.room]) Memory.remotes[this.meta.room] = {};
      if(!Memory.remotes[this.meta.room][this.meta.target]) Memory.remotes[this.meta.room][this.meta.target] = [];
      if(Memory.remotes[this.meta.room][this.meta.target].indexOf(this.meta.sourceID) < 0) {
        Memory.remotes[this.meta.room][this.meta.target].push(this.meta.sourceID);
        console.log(`Registered remote ${this.meta.target} for room ${this.meta.room}. SourceID: ${this.meta.sourceID}`);
      }
    }
    catch(e) {
      console.log(`Failed to register remote ${this.meta.target} | ${JSON.stringify(e)}`)
    }

    // if(source && source.room.name === 'W59S23') {
    //   this.checkRoads(source.room)
    // }
    if(Memory.triggeredConstruction === false && (!this.meta.lastRoadCheck || (this.meta.lastRoadCheck + 500 < Game.time))) {
      if(room.controller && room.controller.level >= 7 && room.storage && room.storage.my && source && Object.keys(Game.constructionSites).length === 0) {
        // console.log(`Triggering checking roads for remote: ${source.room.name}`);
        this.meta.lastRoadCheck = Game.time;
        /* if(source.room.name === 'W59S23')*/ this.checkRoads(source.room)
        Memory.triggeredConstruction = true;
      }
    }

    // if(this.meta.sourceID === '5aa67e414e6a625357a61fe1' && this.meta.lCreeps && this.meta.lCreeps.indexOf('29_30313114') < -1) {
    //   this.meta.lCreeps.push('29_30313114');
    // }

    if(room && room.controller && room.controller.my) {
      if((!this.suspendedTill || this.suspendedTill === 0) && Game.rooms[this.meta.target] && Game.rooms[this.meta.target].hostiles) {
        const invaders: Creep[] = Game.rooms[this.meta.target].hostiles.filter((c: Creep) => c.getActiveBodyparts(ATTACK) || c.getActiveBodyparts(HEAL) || c.getActiveBodyparts(RANGED_ATTACK));
        if(invaders.length) {
          const maxInvader: Creep = _.max(invaders, i => i.ticksToLive);
          if(maxInvader.ticksToLive) {
             this.suspendedTill = Game.time + maxInvader.ticksToLive;
             if(!Memory.attackedRemotes[this.meta.target]) {
               Memory.attackedRemotes[this.meta.target] = invaders.length; // Number of invaders for now. TODO: make a treath score or something
             }
          }
        }
      }
      if(!Memory.scoutReports[this.meta.target]) {
        if(!global.OS.kernel.hasProcessForNameAndMetaKeyValue('scoutRoom', 'target', this.meta.target)) {
          global.OS.kernel.addProcess('scoutRoom', {room: this.meta.room,target: this.meta.target}, this.ID);
        }
      }
      else {
        if(room.controller && room.controller.level >= 7 && room.storage && room.storage.my) {
          if(!global.OS.kernel.hasProcessForNameAndMetaKeyValue('reserveRoom', 'target', this.meta.target)) {
            global.OS.kernel.addProcess('reserveRoom', {room: this.meta.room,target: this.meta.target}, this.ID);
          }
        }
        if(room.controller && room.controller.level >= 8 && room.storage && room.storage.my) {
          if(this.meta.lCreeps && this.meta.lCreeps.length) {
            _.forEach(this.meta.lCreeps, n => Game.creeps[n].suicide());
          }
          this.handleCreeps();
          this.checkContainers();
        }
        else {
          try {
            if(this.meta.haulers && this.meta.haulers.length) {
              _.forEach(this.meta.haulers, n => Game.creeps[this.meta.haulers[n]].suicide());
            }
            if(this.meta.miner && Game.creeps[this.meta.miner]) {
              Game.creeps[this.meta.miner].suicide();
            }
          }
          catch(e) {}
          this.handleCreepsLow(room);
        }
      }
    }
    else {
      this.state = 'killed';
    }
  }

  checkContainers()
  {
    const source: Source|null = Game.getObjectById(this.meta.sourceID);
    if(source) {
      // if(source.room.name === 'W15S3') {
      //   this.initRoom(source, Game.rooms[this.meta.room]);
      // }
      // if(!Memory.lastRemoteRoads || Memory.lastRemoteRoads === Game.time || Memory.lastRemoteRoads + 100  < Game.time) {
      //   StructuresHelper.remoteRoads(source, Game.rooms[this.meta.room]);
      //   Memory.lastRemoteRoads = Game.time;
      // }
      const containers = source.pos.findInRange(source.room.containers, 1);
      if(!containers.length) {
        const constructionSites = source.pos.findInRange(source.room.constructionSites, 1);
        if(!constructionSites.length) {
          // PLACE THAT GODDAMN CONTAINER!!!!
          if(!this.meta.containerX || !this.meta.containerY) {
            // Find a nice spot
            if(source.room.controller) {
              let path: PathStep[] = source.room.findPath(source.room.controller.pos, source.pos, {
                ignoreCreeps: true,
                ignoreRoads: true,
                ignoreDestructibleStructures: true
              });
              let lastStep: PathStep = path[path.length - 2];
              this.meta.containerX = lastStep.x;
              this.meta.containerY = lastStep.y;
            }
          }
          if(this.meta.containerX && this.meta.containerY) {
            source.room.createConstructionSite(this.meta.containerX, this.meta.containerY, STRUCTURE_CONTAINER);
          }
        }
      }
    }
  }

  // Method for rcl < 5
  handleCreepsLow(room: Room)
  {
    if(!this.meta.lCreeps) {
      this.meta.lCreeps = [];
    }
    for(let i = 0, iEnd = this.meta.lCreeps.length; i < iEnd; i++) {
      const creep = Game.creeps[this.meta.lCreeps[i]];
      if(!creep) {
        this.meta.lCreeps[i] = null;
      }
      else if(creep && creep.spawning) {

      }
      else if(creep) {
        this.handleLow(creep);
      }
    }
    this.meta.lCreeps = this.meta.lCreeps.filter((n: any) => n);
    const maxCreeps = room.controller && room.controller.level < 2 ? 1 : (room.controller && room.controller.level > 7 ? 2 : 3);
    let canSpawn = true;
    // if(room.storage && room.storage.my && room.storage.store[RESOURCE_ENERGY] < 10000) {
    //   canSpawn = false;
    // }
    if (canSpawn && this.meta.lCreeps.length < maxCreeps) {
      if(SpawnsHelper.spawnAvailable(room)) {
        let bodyParts;
        if(!room.storage) {
          bodyParts = [MOVE,MOVE,CARRY,WORK];
        }
        else if(room.storage && room.controller && room.controller.level < 6) {
          bodyParts = [MOVE,MOVE,MOVE,MOVE,CARRY,CARRY,WORK,WORK];
        }
        else if(room.storage && room.controller && room.controller.level < 7){
          bodyParts = [MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,CARRY,CARRY,CARRY,WORK,WORK,WORK];
        }
        else {
          bodyParts = [MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,CARRY,CARRY,CARRY,CARRY,WORK,WORK,WORK,WORK,WORK];
        }
        SpawnsHelper.requestSpawn(this.ID, room, bodyParts, {role: 'remoteWorker'}, 'lCreeps[]');
      }
    }
  }

  handleLow(creep: Creep)
  {
    if(_.sum(creep.carry) === 0) {
      creep.memory.harvesting = true;
      creep.memory.targetID = null;
      creep.memory.target = '';
    }
    else if(_.sum(creep.carry) === creep.carryCapacity) {
      creep.memory.harvesting = false;
    }
    if(creep.memory.harvesting) {
      if(creep.room.name !== this.meta.target) {
        creep.moveToRoom(this.meta.target);
      }
      else {
        const source: Source|null = Game.getObjectById(this.meta.sourceID);
        if(source) {
          if(creep.pos.isNearTo(source)) {
            creep.harvest(source);
          }
          else {
            creep.moveTo(source, {maxRooms: 1});
          }
        }
      }
    }
    else {
      if(creep.room.name !== this.meta.room) {
        creep.moveToRoom(this.meta.room);
      }
      else {
        if(!creep.memory.target && creep.room.storage && creep.room.storage.my && creep.room.storage.store[RESOURCE_ENERGY] < 50000) {
          creep.memory.target = 'storage';
        }
        // else if(creep.room.constructionSites.length) {
        //   const target = creep.pos.findClosestByRange(creep.room.constructionSites);
        //   if(target && creep.build(target) === ERR_NOT_IN_RANGE) {
        //     creep.moveTo(target, {maxRooms:1});
        //   }
        // }
        else if(!creep.memory.target && creep.room.storage && creep.room.storage.my && (creep.room.storage.store[RESOURCE_ENERGY] < 100000 || Math.floor(Math.random() * 4))) {
          creep.memory.target = 'storage';
        }
        else if(!creep.memory.target || creep.memory.target !== 'storage') {
          Worker.run(creep, this.meta.sourceID, '');
        }
        //else {
          if(creep.memory.target === 'storage' && creep.room.storage) {
            let target: StructureStorage|StructureLink|null = null;
            const linksInRange = creep.pos.findInRange(creep.room.links.filter((l:StructureLink) => l.energy < l.energyCapacity), 6);
            if(creep.room.storage && !creep.pos.inRangeTo(creep.room.storage, 3) && linksInRange && linksInRange.length) {
                const closestLink = creep.pos.findClosestByRange(linksInRange);
                if(closestLink) {
                  const distanceToStorage = creep.pos.getRangeTo(creep.room.storage);
                  const distanceToLink = creep.pos.getRangeTo(closestLink);
                  if(distanceToStorage > distanceToLink) {
                    target = closestLink;
                  }
                }
            }
            if(!target) {
              target = creep.room.storage;
            }
            if(!creep.pos.isNearTo(target)) {
              creep.moveTo(target, {maxRooms: 1});
            }
            else {
              creep.transfer(target, RESOURCE_ENERGY);
            }
          }
        //}
      }
    }
  }

  handleCreeps()
  {
    this.handleMiner();
    this.handleHaulers();
  }

  handleHaulers()
  {
    if(!this.meta.haulers) {
      this.meta.haulers = [];
      if(this.meta.hauler) {
        this.meta.haulers.push(this.meta.hauler);
        this.meta.hauler = null;
      }
    }
    for(let i = 0, iEnd = this.meta.haulers.length; i < iEnd; i++) {
      const creep = Game.creeps[this.meta.haulers[i]];
      if(!creep) {
        this.meta.haulers[i] = null;
      }
      else if(creep && creep.spawning) {

      }
      else if(creep) {
        RemoteHauler.run(creep, this.meta.room, this.meta.target, this.meta.sourceID);
      }
    }
    this.meta.haulers = this.meta.haulers.filter((n: any) => n);
    let maxHaulers = 1;
    const source: Source|null = Game.getObjectById(this.meta.sourceID);
    if(source) {
      const containers = source.pos.findInRange(source.room.containers, 1);
      if(containers && containers.length) {
        if(containers[0].store[RESOURCE_ENERGY] === containers[0].storeCapacity) {
          maxHaulers = 2;
        }
      }
    }
    if(this.meta.haulers.length < maxHaulers) {
      if(this.meta.miner && SpawnsHelper.spawnAvailable(Game.rooms[this.meta.room])) {
        let bodyParts;
        const room = Game.rooms[this.meta.room];
        if(room.controller && room.controller.level <= 7) {
          bodyParts = [CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,WORK,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE];
        }
        else {
          bodyParts = [CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,WORK,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE]
        }
        SpawnsHelper.requestSpawn(this.ID, Game.rooms[this.meta.room], bodyParts, {role: 'remotehauler'}, 'haulers[]');
      }
    }
  }

  handleMiner()
  {
    if(!this.meta.miner || !Game.creeps[this.meta.miner]) {
      if(SpawnsHelper.spawnAvailable(Game.rooms[this.meta.room])) {
        const room = Game.rooms[this.meta.room];
        let bodyParts;
        if(room.controller && room.controller.level < 7) {
          bodyParts = [WORK,WORK,WORK,WORK,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE];
        }
        else {
          bodyParts = [WORK,WORK,WORK,WORK,WORK,WORK,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE];
        }
        SpawnsHelper.requestSpawn(this.ID, Game.rooms[this.meta.room], bodyParts, {role: 'remoteMiner'}, 'miner');
      }
    }
    else if(Game.creeps[this.meta.miner] && Game.creeps[this.meta.miner].spawning) {
      // TODO: cache paths and eat a pizza
    }
    else if(Game.creeps[this.meta.miner]) {
      RemoteMiner.run(Game.creeps[this.meta.miner], this.meta.target, this.meta.sourceID);
    }
  }
}

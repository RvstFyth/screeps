import {Process} from '../ROS/process'
import {SpawnsHelper} from '../helpers/spawns'
import {RemoteMiner} from '../roles/remoteMiner'
import {RemoteHauler} from '../roles/remoteHauler'
import {StructuresHelper} from '../helpers/structures'
import {PathingHelper} from '../helpers/pathing'

// META:
// room
// target
// sourceID
// global.OS.kernel.addProcess('remoteMining', {room: 'W51S32', target: 'W51S31', sourceID: '59bbc4192052a716c3ce75b5'}, 0)
export class RemoteMining extends Process
{
  initRoom(source: Source, mainRoom: Room)
  {
    if(!this.meta.roads) {
      if(mainRoom.storage) {
        const path = source.room.findPath( source.pos, mainRoom.storage.pos, {
          ignoreCreeps: true,
          ignoreRoads: true,
          ignoreDestructibleStructures: true
        });
        this.meta.roads = PathingHelper.pathToString(path);
      }
    }
    else {

    }
  }

  checkRoads(room: Room)
  {
    const path = PathingHelper.stringToPath(this.meta.roads);
    for(let i in path) {
      room.visual.circle(path[i].x, path[i].y, {stroke: 'orange'});
    }
  }

  run()
  {
    const room = Game.rooms[this.meta.room];
    if(this.suspendedTill && this.suspendedTill > 0 && Game.time < this.suspendedTill) {
      return;
    }
    else {
      this.suspendedTill = 0;
    }

    if(room) {
      if((!this.suspendedTill || this.suspendedTill === 0) && Game.rooms[this.meta.target] && Game.rooms[this.meta.target].hostiles) {
        const invaders: Creep[] = Game.rooms[this.meta.target].hostiles.filter((c: Creep) => c.owner.username.toLowerCase() === 'invader');
        if(invaders.length) {
          const maxInvader: Creep = _.max(invaders, i => i.ticksToLive);
          if(maxInvader.ticksToLive) {
             this.suspendedTill = Game.time + maxInvader.ticksToLive
          }
        }
      }
      if(!Memory.scoutReports[this.meta.target]) {
        if(!global.OS.kernel.hasProcessForNameAndMetaKeyValue('scoutRoom', 'target', this.meta.target)) {
          global.OS.kernel.addProcess('scoutRoom', {room: this.meta.room,target: this.meta.target}, this.ID);
        }
      }
      else {
        if(!global.OS.kernel.hasProcessForNameAndMetaKeyValue('reserveRoom', 'target', this.meta.target)) {
          global.OS.kernel.addProcess('reserveRoom', {room: this.meta.room,target: this.meta.target}, this.ID);
        }
        this.handleCreeps();
        this.checkContainers();
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
      if(source.room.name === 'W15S3') {
        this.initRoom(source, Game.rooms[this.meta.room]);
      }
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

  handleCreeps()
  {
    this.handleMiner();
    this.handleHauler();
  }

  handleHauler()
  {
    if(!this.meta.hauler || !Game.creeps[this.meta.hauler]) {
      if(SpawnsHelper.spawnAvailable(Game.rooms[this.meta.room])) {
        // this.meta.hauler = SpawnsHelper.spawnCreep(Game.rooms[this.meta.room],
        //   [CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE], {role: 'remotehauler'}, this.ID.toString()
        // )
        SpawnsHelper.requestSpawn(this.ID, Game.rooms[this.meta.room], [CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE], {role: 'remotehauler'}, 'hauler');
      }
    }
    else if(Game.creeps[this.meta.hauler] && Game.creeps[this.meta.hauler].spawning) {

    }
    else if(Game.creeps[this.meta.miner]) {
      RemoteHauler.run(Game.creeps[this.meta.hauler], this.meta.room, this.meta.target, this.meta.sourceID);
    }
  }

  handleMiner()
  {
    if(!this.meta.miner || !Game.creeps[this.meta.miner]) {
      if(SpawnsHelper.spawnAvailable(Game.rooms[this.meta.room])) {
        // this.meta.miner = SpawnsHelper.spawnCreep(Game.rooms[this.meta.room],
        //   [WORK,WORK,WORK,WORK,WORK,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE], {role: 'remoteMiner'}, this.ID.toString()
        // )
        SpawnsHelper.requestSpawn(this.ID, Game.rooms[this.meta.room], [WORK,WORK,WORK,WORK,WORK,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE], {role: 'remoteMiner'}, 'miner');
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

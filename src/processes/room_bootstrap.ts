import {Process} from '../ROS/process'
import {SpawnsHelper} from '../helpers/spawns'
import {Builder} from '../roles/builder'
import {Worker} from '../roles/worker'
import {Upgrader} from '../roles/upgrader'

export class Room_Bootstrap extends Process
{

  init()
  {
    return true;
    // let workers = Game.rooms[this.meta.room].find(FIND_MY_CREEPS, {
    //   filter: (c: Creep) => c.memory.role === 'worker'
    // });
    //
    // if(!this.meta.builder) {
    //   let builder = Game.rooms[this.meta.room].find(FIND_MY_CREEPS, {
    //     filter: (c: Creep) => c.memory.role === 'builder'
    //   });
    //   if(builder && builder.length) {
    //     this.meta.builder = builder[0];
    //   }
    // }
  }

  run()
  {
    if(!Game.rooms[this.meta.room]) {
      this.state = 'killed';
      return;
    }
    const room = Game.rooms[this.meta.room];

    if(!this.meta.targets) {
      this.meta.targets = [];
    }
    if(!this.meta.sources) {
      this.meta.sources = {};
      for(let n in room.sources) {
        this.meta.sources[room.sources[n].id] = {}
      }
    }

    if(!this.meta.initialized) {
      this.init();
    }

    for(let s in this.meta.sources) {
      let numWorkers = this.defineWorkersCount(room);

      if(!this.meta.sources[s].creeps) {
        this.meta.sources[s].creeps = [];
      }
      const source = this.meta.sources[s];
      let link = '';
      const sourceObject: Source|null = Game.getObjectById(s);
      if(sourceObject) {
        const links: StructureLink[] = sourceObject.pos.findInRange(room.links, 2);
        if(links.length) {
          link = links[0].id;
        }
      }
      //let dedicatedUpgrader = source.creeps.filter((c: any) => c.memory.upgrader).length;
      this.handleUpgrader(room);
      for(let n in source.creeps) {

        if(!Game.creeps[source.creeps[n]]) {
          this.meta.sources[s].creeps[n] = null;
        }
        else if(Game.creeps[source.creeps[n]].spawning) {
            // Maybe some fancy path finding calculations etc... To save on CPU
        }
        else if(Game.creeps[source.creeps[n]]) {
          Worker.run(Game.creeps[source.creeps[n]], s, link);
        }

        source.creeps = source.creeps.filter((n: any) => n); // Remove NULL values
      }

      if(source.creeps.length < numWorkers) {
          if(SpawnsHelper.spawnAvailable(room)) {
            let name = SpawnsHelper.spawnCreep(room, Worker.defineBodyParts(room), {role: 'worker'}, this.ID.toString());
            if(name !== '') {
              this.meta.sources[s].creeps.push(name);
            }
            // SpawnsHelper.requestSpawn(this.ID, room, Worker.defineBodyParts(room), {role: 'worker'}, 'miner');
          }
      }
    }
    this.handleBuilder(room);
    //console.log(`Running bootstrap process for room ${this.meta.room}`);
  }

  handleUpgrader(room: Room)
  {
    if(room.storage) {
      if(Game.creeps[this.meta.upgrader]) {
        Game.creeps[this.meta.upgrader].suicide();
      }
    }
    else {
      if(!Game.creeps[this.meta.upgrader]) {
        if(SpawnsHelper.spawnAvailable(room)) {
          let name = SpawnsHelper.spawnCreep(room, [WORK,CARRY,MOVE,MOVE], {role: 'upgrader'},this.ID.toString());
          if(name !== '') {
            this.meta.upgrader = name;
          }
        }
      }
      else if(Game.creeps[this.meta.upgrader].spawning) {

      }
      else if(Game.creeps[this.meta.upgrader]){
        Upgrader.run(Game.creeps[this.meta.upgrader]);
      }
    }
  }

  handleBuilder(room: Room)
  {
    // Builder creep
    if(!Game.creeps[this.meta.builder]) {
      let constructionSites = room.find(FIND_CONSTRUCTION_SITES);
      if(constructionSites && constructionSites.length && SpawnsHelper.spawnAvailable(room)) {
        let name = SpawnsHelper.spawnCreep(room, Builder.defineBodyParts(room), {role: 'builder'}, this.ID.toString());
        if(name !== '') {
          this.meta.builder = name;
        }
      }
    }
    else if(Game.creeps[this.meta.builder].spawning) {

    }
    else if(Game.creeps[this.meta.builder]){
      Builder.run(Game.creeps[this.meta.builder]);
    }
  }

  defineWorkersCount(room: Room)
  {
    if(!room.storage) {
      return 4;
    }
    if(typeof room.controller !== 'undefined'  && room.controller.level >= 3) {
      if(room.controller.level < 8 && room.storage && room.storage.store[RESOURCE_ENERGY] > 200000) {
        return 2;
      }
      else if(room.storage || room.controller.level === 8) {
        return 1;
      }
      //return 3;
    }
    return 2;
  }
}

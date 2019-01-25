import {Process} from '../ROS/process'
import {Miner} from '../roles/miner'
import {Hauler} from '../roles/hauler'
import {SpawnsHelper} from '../helpers/spawns'


export class Source extends Process
{

  run()
  {
    const source:any = Game.getObjectById(this.meta.sourceID);
    let link = '';
    const links:StructureLink[] = source.pos.findInRange(source.room.links, 2, {
      filter: (l: StructureLink) => l.energy < l.energyCapacity
    });
    if(links.length) {
      link = links[0].id;
    }

    if(source && source.room && source.room.controller && source.room.controller.my) {
      if(!this.meta.miner || !Game.creeps[this.meta.miner]) {
        if(SpawnsHelper.spawnAvailable(source.room)) {
          SpawnsHelper.requestSpawn(this.ID, source.room, Miner.defineBodyParts(source.room), {role: 'miner'}, 'miner');
        }
      }
      else if(Game.creeps[this.meta.miner] && Game.creeps[this.meta.miner].spawning) {

      }
      else if(Game.creeps[this.meta.miner]) {
        Miner.run(Game.creeps[this.meta.miner], this.meta.sourceID, link);
      }

      const container = source.pos.findInRange(source.room.container, 1, {
          filter: (c: StructureContainer) => _.sum(c.store) > 0
        });

      // hauler
      const canSpawn = !link && source.room.storage && source.room.storage.my && (!this.meta.hauler || !Game.creeps[this.meta.hauler]);
      this.handleHaulers(canSpawn);
    }
    else {
      this.state = 'killed';
    }
  }

  handleHaulers(canSpawn: boolean)
  {
    if(!this.meta.haulers) {
      this.meta.haulers = [];
      if(this.meta.hauler) { // Migration line
        this.meta.haulers.push(this.meta.hauler);
      }
    }

    for(let i in this.meta.haulers) {
      const creep = Game.creeps[this.meta.haulers[i]];
      if(!creep) {
        this.meta.haulers[i] = null;
      }
      else if(creep && creep.spawning) {

      }
      else if(creep) {
        Hauler.run(creep, this.meta.sourceID);
      }
    }
    this.meta.haulers = this.meta.haulers.filter((n: any) => n); // Remove NULL values
    if(canSpawn) {
      let maxHaulers = 1;
      const s:any = Game.getObjectById(this.meta.sourceID);
      if(s) {
        const containers: StructureContainer[] = s.pos.findInRange(s.room.containers, 1);
        if(containers && containers.length) {
          if(containers[0].store[RESOURCE_ENERGY] === containers[0].storeCapacity) {
            maxHaulers = 2;
          }
        }
      }
      if(this.meta.haulers.length < maxHaulers) {
        if(SpawnsHelper.spawnAvailable(s.room)) {
          SpawnsHelper.requestSpawn(this.ID, s.room, Hauler.defineBodyParts(s.room), {role: 'hauler'}, 'haulers[]');
        }
      }
    }
  }
}

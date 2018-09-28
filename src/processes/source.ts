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

    if(source) {
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

      // hauler
      if(!link && source.room.storage && (!this.meta.hauler || !Game.creeps[this.meta.hauler])) {
        if(SpawnsHelper.spawnAvailable(source.room)) {
            SpawnsHelper.requestSpawn(this.ID, source.room, Hauler.defineBodyParts(source.room), {role: 'hauler'}, 'hauler');
        }
      }
      else if(Game.creeps[this.meta.hauler] && Game.creeps[this.meta.hauler].spawning) {

      }
      else if(Game.creeps[this.meta.hauler]) {
        if(source.room.controller.level === 8 && link) {
          Game.creeps[this.meta.hauler].suicide();
        }
        else {
          Hauler.run(Game.creeps[this.meta.hauler], this.meta.sourceID);
        }
      }
    }
    else {
      this.state = 'killed';
    }
  }
}

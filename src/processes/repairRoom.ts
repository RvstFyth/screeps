import {Process} from '../ROS/process'
import {SpawnsHelper} from '../helpers/spawns'
import {Rampart} from '../roles/rampart'

export class RepairRoom extends Process
{
  run()
  {
    const room = Game.rooms[this.meta.room];
    if(room && room.controller && room.controller.my) {
      this.handleRamparts(room);
    }
    else {
      this.state = 'killed';
    }
  }

  handleRamparts(room: Room)
  {
    if(!this.meta.creeps) {
      this.meta.creeps = [];
    }
    const constructionSites = room.constructionSites.filter((c: ConstructionSite) => c.structureType === STRUCTURE_RAMPART);

    if(room.ramparts.length || constructionSites.length) {
      for(let n in this.meta.creeps) {

        if(!Game.creeps[this.meta.creeps[n]]) {
          this.meta.creeps[n] = null;
        }
        else if(Game.creeps[this.meta.creeps[n]].spawning) {
            // Maybe some fancy path finding calculations etc... To save on CPU
        }
        else if(Game.creeps[this.meta.creeps[n]]) {
          Rampart.run(Game.creeps[this.meta.creeps[n]]);
        }
      }
      this.meta.creeps = this.meta.creeps.filter((n: any) => n); // Remove NULL values

      if(this.meta.creeps.length < this.defineRampartsCount(room)) {
        if(room.storage && room.storage.store[RESOURCE_ENERGY] > 50000  && SpawnsHelper.spawnAvailable(room)) {
          SpawnsHelper.requestSpawn(this.ID, room, Rampart.defineBodyParts(room), {role: 'rampart'}, 'creeps[]');
        }
      }
    }
  }

  defineRampartsCount(room: Room)
  {
    if(room.storage && room.storage.store[RESOURCE_ENERGY] > 300000) {
      return 2;
    }
    if(room.storage && room.storage.store[RESOURCE_ENERGY] > 500000) {
      return 4;
    }
    return 1;
  }
}

import {Process} from '../ROS/process'
import {SpawnsHelper} from '../helpers/spawns'
import {Upgrader} from '../roles/upgrader'

export class UpgradeRoom extends Process
{


  run()
  {
    const room = Game.rooms[this.meta.room];
    if(room) {
      if(!this.meta.creeps) {
        this.meta.creeps = [];
      }

      for(let n in this.meta.creeps) {

        if(!Game.creeps[this.meta.creeps[n]]) {
          this.meta.creeps[n] = null;
        }
        else if(Game.creeps[this.meta.creeps[n]].spawning) {
            // Maybe some fancy path finding calculations etc... To save on CPU
        }
        else if(Game.creeps[this.meta.creeps[n]]) {
          Upgrader.run(Game.creeps[this.meta.creeps[n]]);
        }
      }
      this.meta.creeps = this.meta.creeps.filter((n: any) => n); // Remove NULL values

      if(this.defineUpgradersCount(room) > 0 && this.meta.creeps.length < this.defineUpgradersCount(room)) {
        if(SpawnsHelper.spawnAvailable(room)) {
          // let name = SpawnsHelper.spawnCreep(room, Upgrader.defineBodyParts(room), {role: 'upgrader'}, this.ID.toString());
          // if(name) {
          //   this.meta.creeps.push(name);
          // }
          SpawnsHelper.requestSpawn(this.ID, room, Upgrader.defineBodyParts(room), {role: 'upgrader'}, 'creeps[]');
        }
      }
    }
    else {
      this.state = 'killed';
    }
  }

  defineUpgradersCount(room: Room)
  {
    if(room.controller && room.controller.level === 8 && room.storage && room.storage.store[RESOURCE_ENERGY] > 500000) {
      return 1;
    }
    else if(room.controller && room.controller.level === 8) {
      return 0;
    }
    if(room.storage && room.storage.store[RESOURCE_ENERGY] < 200000) {
      return 2;
    }
    else if(room.storage) {
      return Math.floor(room.storage.store[RESOURCE_ENERGY] / 50000);
    }

    return 2;
  }
}

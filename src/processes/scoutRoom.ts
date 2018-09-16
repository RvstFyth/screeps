import {Process} from '../ROS/process'
import {SpawnsHelper} from '../helpers/spawns'
import {Scout} from '../roles/scout'

// OS.kernel.addProcess('scoutRoom', {room: 'W59S21', target: 'W58S17'}, 0);
export class ScoutRoom extends Process
{
  run()
  {
    //this.state = 'killed';
    if(Memory.scoutReports[this.meta.target]) {
      this.state = 'killed';
    }
    else {
      if(!this.meta.scout || !Game.creeps[this.meta.scout]) {
        if(SpawnsHelper.spawnAvailable(Game.rooms[this.meta.room])) {
          this.meta.scout = SpawnsHelper.spawnCreep(Game.rooms[this.meta.room], [MOVE], {role: 'scout'}, this.ID.toString())
        }
      }
      else if(Game.creeps[this.meta.scout].spawning) {

      }
      else if(Game.creeps[this.meta.scout]) {
        Scout.run(Game.creeps[this.meta.scout], this.meta.target);
      }
    }
  }
}

import {Process} from '../ROS/process'
import {Transporter} from '../roles/transporter'
import {SpawnsHelper} from '../helpers/spawns'

export class Transport extends Process
{

  run()
  {
    // Default 1 transporter. It will fill all extensions, spawns and towers.
    // During attacks 2 transporters. Only spawn when defenders are already spawned!!
    const room = Game.rooms[this.meta.room];
    if(!room || !room.controller || !room.controller.my) {
      this.state = 'killed';
      return;
    }

    if(!this.meta.creeps) {
      this.meta.creeps = [];
    }

    for(let i in this.meta.creeps) {
      if(!Game.creeps[this.meta.creeps[i]]) {
        this.meta.creeps[i] = null;
      }
      else if(Game.creeps[this.meta.creeps[i]].spawning) {

      }
      else if(Game.creeps[this.meta.creeps[i]]) {
        Transporter.run(Game.creeps[this.meta.creeps[i]]);
      }
    }

    this.meta.creeps = this.meta.creeps.filter((n: any) => n);

    if(this.meta.creeps.length < this.defineTotalTransporters())  {
      const room = Game.rooms[this.meta.room];
      if(room && room.storage && room.storage.my && SpawnsHelper.spawnAvailable(Game.rooms[this.meta.room])) {
        // let name = SpawnsHelper.spawnCreep(Game.rooms[this.meta.room], Transporter.defineBodyParts(Game.rooms[this.meta.room]), {role: 'transporter'}, this.ID.toString());
        // if(name) {
        //   this.meta.creeps.push(name);
        // }
        SpawnsHelper.requestSpawn(this.ID, Game.rooms[this.meta.room], Transporter.defineBodyParts(Game.rooms[this.meta.room]), {role: 'transporter'}, 'creeps[]');
      }
    }
  }

  defineTotalTransporters()
  {
    return 1;
  }
}

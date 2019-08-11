import {Process} from '../ROS/process'
import {Transporter} from '../roles/transporter'
import {SpawnsHelper} from '../helpers/spawns'
import {BlueprintsHelper} from '../helpers/blueprint'

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
    let cnt = 0;
    for(let i in this.meta.creeps) {
      if(!Game.creeps[this.meta.creeps[i]]) {
        this.meta.creeps[i] = null;
      }
      else if(Game.creeps[this.meta.creeps[i]].spawning) {

      }
      else if(Game.creeps[this.meta.creeps[i]]) {
        let spot = null;
        if (room.memory.blueprintType && room.memory.blueprintKey) {
            if (BlueprintsHelper.transporterSpots[room.memory.blueprintType] && BlueprintsHelper.transporterSpots[room.memory.blueprintType][room.memory.blueprintKey]) {
                if (BlueprintsHelper.transporterSpots[room.memory.blueprintType][room.memory.blueprintKey][cnt]) {
                    const pos = BlueprintsHelper.transporterSpots[room.memory.blueprintType][room.memory.blueprintKey][cnt];
                    if (pos) {
                        spot = {
                            x: room.memory.centerX + pos.x,
                            y: room.memory.centerY + pos.y
                        }
                    }
                }
            }
        }
        Transporter.run(Game.creeps[this.meta.creeps[i]], spot);
      }
      cnt++;
    }

    this.meta.creeps = this.meta.creeps.filter((n: any) => n);

    if(this.meta.creeps.length < this.defineTotalTransporters(room))  {
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

  defineTotalTransporters(room: Room) : number
  {
    return room.spawns.length > 2 ? 2 : room.spawns.length;
  }
}

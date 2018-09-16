import {Process} from '../ROS/process'
import {Room} from './room';

export class Init extends Process
{

  run()
  {
    console.log("Running init process");

    let room;
    for(let n in Game.rooms) {
      room = Game.rooms[n];
      if(room.hasOwnProperty('controller') && typeof room.controller !== 'undefined') {
        if(room.controller.my === true) {
          if(!global.OS.kernel.hasProcessForNameAndMetaKeyValue('room', 'name', room.name)) {
            global.OS.kernel.addProcess('room', {name: room.name}, 0);
          }
        }
        else {
          // Remote room
        }
      }
    }


    this.state = 'killed';
  }

}

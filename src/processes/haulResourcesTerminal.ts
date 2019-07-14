import {Process} from '../ROS/process'
import {SpawnsHelper} from '../helpers/spawns'

// META:
// room
// amount
// resource
// Process to haul resources from storage => terminal
export class HaulResourcesTerminal extends Process
{

  run()
  {
    const room = Game.rooms[this.meta.room];

    if(room) {
      if(!this.meta.transfered) {
        this.meta.transfered = 0;
      }
      if(typeof this.meta.amout !== 'undefined') {
        this.meta.amount = this.meta.amout;
      }
      if(this.meta.transfered >= this.meta.amount) {
        this.killProcess();
      }
      else {
        this.handleTransporter();
      }
    }
    else {
      this.killProcess();
    }
  }

  killProcess()
  {
    if(Game.creeps[this.meta.transporter]) {
      Game.creeps[this.meta.transporter].suicide();
    }
    else {
      this.state = 'killed';
    }
  }

  handleTransporter()
  {
    if(!this.meta.transporter || !Game.creeps[this.meta.transporter]) {
      if(SpawnsHelper.spawnAvailable(Game.rooms[this.meta.room])) {
        this.meta.transporter = SpawnsHelper.spawnCreep(Game.rooms[this.meta.room],
          [CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE], {role: 'resourceTransporter'}, this.ID.toString()
        );
      }
    }
    else if(Game.creeps[this.meta.transporter] && Game.creeps[this.meta.transporter].spawning) {

    }
    else if(Game.creeps[this.meta.transporter]) {
      const creep = Game.creeps[this.meta.transporter];
      if(_.sum(creep.carry) === 0) {
        if(creep.room.storage) {
          if(!creep.pos.isNearTo(creep.room.storage)) {
            creep.moveTo(creep.room.storage);
          }
          else {
            creep.withdraw(creep.room.storage, this.meta.resource)
          }
        }
      }
      else {
        if(creep.room.terminal) {
          if(!creep.pos.isNearTo(creep.room.terminal)) {
            creep.moveTo(creep.room.terminal);
          }
          else {
            const amount = creep.carry[this.meta.resource as ResourceConstant];
            if(creep.transfer(creep.room.terminal, this.meta.resource) === OK) {
              this.meta.transfered += amount;
              if(creep.room.storage) {
                creep.moveTo(creep.room.storage);
              }
            }
          }
        }
      }
    }
  }
}

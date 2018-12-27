import {Process} from '../ROS/process'
import {SpawnsHelper} from '../helpers/spawns'

// META:
// room
// target
// resource
// amount
// catalyzed ghodium alkalide
// global.OS.kernel.addProcess('sendResources', {room: 'W56S33', target: 'W59S21', resource: RESOURCE_CATALYZED_GHODIUM_ALKALIDE, amount: 30000}, 0)
export class SendResources extends Process
{

  run()
  {
    if(this.meta.room === 'W56S33') {
      // console.log(this.meta.target);
      //  this.state = 'killed';
      //  if(Game.creeps[this.meta.transporter]) {
      //    Game.creeps[this.meta.transporter].suicide();
      //  }
    }
    if(typeof this.meta.done === 'undefined') {
      this.meta.done = false;
    }
    const room = Game.rooms[this.meta.room];
    if(!this.meta.energyNeeded) {
      this.meta.energyNeeded = Game.market.calcTransactionCost(this.meta.amount, this.meta.room, this.meta.target);
    }
    if(room.terminal) {
      if(room.terminal.store[RESOURCE_ENERGY] < this.meta.energyNeeded) {
        this.transport(room);
      }
      else if(!this.meta.done) {
        const r = this.meta.resource as ResourceConstant;
        const rAmount = room.terminal.store[r];
        let amountNeeded = this.meta.amount;
        if(this.meta.resource === RESOURCE_ENERGY) {
          amountNeeded += this.meta.energyNeeded;
        }
        if(!rAmount || rAmount < amountNeeded) {
          this.meta.done = false;
          this.transport(room);
        }
        else {
          if(room.terminal.send(this.meta.resource, this.meta.amount, this.meta.target) === OK) {
            global.OS.kernel.addProcess('haulResources', {room: this.meta.target, resource: this.meta.resource, amount: this.meta.amount}, 0)
            this.meta.done = true;
          }
        }
      }
      else {
        if(this.meta.transporter && Game.creeps[this.meta.transporter]) {
          Game.creeps[this.meta.transporter].suicide();
        }
        if(!Game.creeps[this.meta.transporter]) {
          this.state = 'killed';
        }
      }
    }
  }

  transport(room: Room)
  {
    if((!this.meta.transporter || !Game.creeps[this.meta.transporter]) && !this.meta.done) {
      if(SpawnsHelper.spawnAvailable(Game.rooms[this.meta.room])) {
        const rcl = room.controller ? room.controller.level : null;
        let bodyParts = [CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE];
        if(rcl && rcl === 7) {
          bodyParts = [CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE];
        }
        else if(rcl && rcl === 8) {
          bodyParts = [CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE];
        }
        this.meta.transporter = SpawnsHelper.spawnCreep(Game.rooms[this.meta.room],
          bodyParts, {role: 'resourceTransporter'}, this.ID.toString()
        )
      }
    }
    else if(Game.creeps[this.meta.transporter] && Game.creeps[this.meta.transporter].spawning) {

    }
    else if(Game.creeps[this.meta.transporter]) {
      const creep = Game.creeps[this.meta.transporter];
      if(creep.room.terminal && creep.room.storage) {
        if(_.sum(creep.carry) === 0) {
          if(!creep.pos.isNearTo(creep.room.storage)) {
            creep.moveTo(creep.room.storage);
          }
          else {
            if(creep.withdraw(creep.room.storage, this.meta.resource) === OK) {
              creep.moveTo(creep.room.terminal);
            }
          }
        }
        else {
          if(!creep.pos.isNearTo(creep.room.terminal)) {
            creep.moveTo(creep.room.terminal);
          }
          else {
            creep.transfer(creep.room.terminal, _.findKey(creep.carry) as ResourceConstant);
          }
        }
      }
    }
  }
}

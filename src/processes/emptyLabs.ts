import {Process} from '../ROS/process'
import {SpawnsHelper} from '../helpers/spawns'

// META:
// room
export class EmptyLabs extends Process
{

  run()
  {
    const room: Room = Game.rooms[this.meta.room];
    // this.state = 'killed';
    if(!this.meta.creep || !Game.creeps[this.meta.creep]) {
      if(SpawnsHelper.spawnAvailable(room)) {
        this.meta.creep = SpawnsHelper.spawnCreep(room, [CARRY,CARRY,MOVE,MOVE,CARRY,CARRY,MOVE,MOVE], {role: 'labsTransporter'}, this.ID.toString());
      }
    }
    else if(Game.creeps[this.meta.creep] && Game.creeps[this.meta.creep].spawning) {

    }
    else if(Game.creeps[this.meta.creep]) {
      const creep = Game.creeps[this.meta.creep];
      const labs = creep.room.labs.filter((l: StructureLab) => l.mineralAmount > 0);
      if(_.sum(creep.carry) === 0) {
        if(!labs.length) {
          creep.suicide();
          this.state = 'killed';
        }
        creep.memory.harvesting = true;
      }
      else if(_.sum(creep.carry) === creep.carryCapacity || !labs.length) {
        creep.memory.harvesting = false;
      }
      if(creep.memory.harvesting && labs.length) {
        this.getResources(creep, labs);
      }
      else {
        this.deliver(creep);
      }
    }
  }

  getResources(creep: Creep, labs: StructureLab[])
  {
    if(!creep.memory.target && labs.length) {
      const target = creep.pos.findClosestByRange(labs);
      if(target) {
        creep.memory.target = target.id;
      }
    }
    const target: StructureLab|null = Game.getObjectById(creep.memory.target);
    if(target) {
      if(!creep.pos.isNearTo(target)) {
        creep.moveTo(target);
      }
      else {
        if(creep.withdraw(target, target.mineralType as ResourceConstant) === OK) {
          creep.memory.target = '';
        }
      }
    }
  }

  deliver(creep: Creep)
  {
    let target;
    if(creep.room.storage) {
      target = creep.room.storage;
    }
    else if(creep.room.terminal) {
      target = creep.room.terminal;
    }
    else {
      target = null;
    }

    if(target) {
      if(!creep.pos.isNearTo(target)) {
        creep.moveTo(target);
      }
      else {
        creep.transfer(target, _.findKey(creep.carry) as ResourceConstant);
      }
    }
  }
}

import {Process} from '../ROS/process'

export class Towers extends Process
{

  run()
  {
    if(!Game.rooms[this.meta.room]) {
      this.state = 'killed';
      return;
    }
    let targetIDs = [];
    let healed = false;
    for(let i in Game.rooms[this.meta.room].towers) {
      const room = Game.rooms[this.meta.room];
      if(room.hostiles.length) {
        room.towers[i].attack(room.hostiles[0]);
      }
      else {
        const damagedCreeps = room.find(FIND_MY_CREEPS, {
          filter: (c: Creep) => c.hits < c.hitsMax
        });
        if(!healed && damagedCreeps.length) {
          room.towers[i].heal(damagedCreeps[0]);
          healed = true;
        }
        else {
          if(room.towers[i].energy > (room.towers[i].energyCapacity / 4) * 3 && Math.floor(Math.random() * 4) === 3) {
            const ramparts = room.ramparts.filter((r: StructureRampart) => r.hits < 100000);
            if(ramparts.length) {
              const rampart = _.min(ramparts, r => r.hits);
              room.towers[i].repair(rampart);
            }
          }
        }
      }
    }
  }

}

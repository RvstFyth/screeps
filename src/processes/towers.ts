import {Process} from '../ROS/process'

export class Towers extends Process
{

  run()
  {
    if(!Game.rooms[this.meta.room]) {
      this.state = 'killed';
      return;
    }
    let healed = false;
    let numRepairs = 0;
    let targetIDs: string[] = [];
    for(let i in Game.rooms[this.meta.room].towers) {
      const room = Game.rooms[this.meta.room];
      if(room.hostiles.length) {
        if(room.hostiles.length === room.invaders.length) { // Means only invaders :)
          targetIDs = this.handleInvaders(room.towers[i], targetIDs);
        }
        else {
          room.towers[i].attack(room.hostiles[0]);
        }
      }
      else {
        const damagedCreeps = room.find(FIND_MY_CREEPS, {
          filter: (c: Creep) => c.hits < c.hitsMax
        });
        if(!healed && damagedCreeps.length) {
          room.towers[i].heal(damagedCreeps[0]);
          healed = true;
        }
        else if(Game.time % 7 === 0) {
          const canRepair = room.towers[i].energy > (room.towers[i].energyCapacity / 4)
          if(canRepair) {
            const ramparts = room.ramparts.filter((r: StructureRampart) => r.hits < 100000); // 100K
            if(numRepairs < 2 && ramparts.length) {
              if(Math.floor(Math.random() * 4) === 3) {
                const rampart = _.min(ramparts, r => r.hits);
                room.towers[i].repair(rampart);
                numRepairs++;
              }
            }
            else {
              if(canRepair && numRepairs < 1) {
                const ramparts = room.ramparts.filter((r: StructureRampart) => r.hits < 7000000); // 7 mill
                if(Math.floor(Math.random() * 2) === 1) {
                  const rampart = _.min(ramparts, r => r.hits);
                  room.towers[i].repair(rampart);
                  numRepairs++;
                }
              }
            }
          }
        }
        else {
          const canRepair = room.towers[i].energy > (room.towers[i].energyCapacity / 4)
          if(canRepair) {
            const roads = room.roads.filter((r: StructureRoad) => r.hits < r.hitsMax); // 100K
            if(numRepairs < 2 && roads.length) {
              if(Math.floor(Math.random() * 4) === 3) {
                const road = _.min(roads, r => r.hits);
                room.towers[i].repair(road);
                numRepairs++;
              }
            }
            else {
              if(numRepairs < 1) {
                const roads = room.roads.filter((r: StructureRoad) => r.hits < r.hitsMax); // 7 mill
                if(Math.floor(Math.random() * 2) === 1) {
                  const road = _.min(roads, r => r.hits);
                  room.towers[i].repair(road);
                  numRepairs++;
                }
              }
            }
          }
        }
      }
    }
  }

  private handleInvaders(tower: StructureTower, targetIDs: string[]) : string[]
  {
    let target: Creep|undefined;
    if(tower.room.invaders.length === 1) {
      const invader = tower.room.invaders[0];
      //if(invader.pos.findInRange(tower.room.ramparts, 3).length) {
        target = tower.room.invaders[0];
      //}
    }
    else {
      const healers = tower.room.invaders.filter((c: Creep) => c.getActiveBodyparts(HEAL) > 0);
      if(healers.length) {
        target = healers[0];
      }
      else {
        const targets = tower.room.invaders.filter((c: Creep) => targetIDs.indexOf(c.id) < 0);
        if(targets.length) {
          tower.attack(targets[0]);
          targetIDs.push(targets[0].id);
        }
        else {
          target = tower.pos.findClosestByRange(tower.room.invaders);
        }
      }
    }

    if(target) {
      tower.attack(target);
    }
    return targetIDs;
  }
}

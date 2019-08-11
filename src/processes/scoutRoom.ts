import { Process } from '../ROS/process';
import { SpawnsHelper } from '../helpers/spawns';
import { Scout } from '../roles/scout';

export class ScoutRoom extends Process {
    public run() {
        this.state = 'killed';
        const room = Game.rooms[this.meta.room];
        if (room && room.controller && room.controller.my) {
            if (typeof this.meta.shouldKill === 'undefined') this.meta.shouldKill = false;
            const creep = Game.creeps[this.meta.creep];
            if (!creep) {
                if (this.meta.shouldKill) this.state = 'killed';
                else SpawnsHelper.requestSpawn(this.ID, room, [MOVE], { role: 'scout' }, 'creep');
            }
            else if (creep && creep.spawning) {

            }
            else if (creep) {
                if (Memory.scoutReports[this.meta.target]) {
                    this.meta.shouldKill = true;
                    const neighbourRooms = Object.values(Game.map.describeExits(this.meta.target));
                    const notVisited = neighbourRooms.filter((n: string | undefined) => n && !Memory.scoutReports[n]);
                    if (notVisited && notVisited.length) {
                        this.meta.target = notVisited[0];
                    }
                    else {
                        this.meta.target = neighbourRooms[Math.floor(Math.random() * neighbourRooms.length)];
                    }
                    console.log(`Changed target for scout ${creep.name} to ${this.meta.target}`);
                }
                Scout.run(creep, this.meta.target);
            }
        }
    }
}

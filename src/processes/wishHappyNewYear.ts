import {Process} from '../ROS/process';
import {SpawnsHelper} from '../helpers/spawns';

export class WishHappyNewYear extends Process
{


    run()
    {
        //return true;
        this.state = 'killed';
        const room = Game.rooms[this.meta.room];
        const creep = Game.creeps[this.meta.creep];

        if(room && room.controller && room.controller.my) {
            if(!creep) {
                if(SpawnsHelper.spawnAvailable(room)) {
                    SpawnsHelper.requestSpawn(this.ID, room, [MOVE], {role: 'retard'}, 'creep');
                }
                this.meta.current = 0;
            }
            else if(creep && creep.spawning) {

            }
            else if(creep) {
                this.handleCreep(creep);
            }
        }
        else {
            this.state = 'killed';
        }
    }

    private handleCreep(creep: Creep)
    {
        if(creep) {
            if(creep.room.name !== this.meta.target) {
                creep.moveToRoom(this.meta.target, true);
            }
            else {
                const x = creep.pos.x;
                const y = creep.pos.y;
                if(x === 0) creep.move(RIGHT);
                if(x === 49) creep.move(LEFT);
                if(y === 0) creep.move(BOTTOM);
                if(y === 49) creep.move(TOP);

                const sayings = [
                    'Hi',
                    '💣',
                    '..',
                    '...',
                    '....',
                    '.....',
                    '⌚',
                    '...',
                    '💥 💥 💥',
                    'HAPPY',
                    'NEW',
                    'YEAR',
                    '✌'
                ];
                if(sayings[this.meta.current]) {
                    creep.say(sayings[this.meta.current], true);
                }
                this.meta.current++;
                if(this.meta.current === sayings.length) this.meta.current = 0;
            }
        }
    }
}

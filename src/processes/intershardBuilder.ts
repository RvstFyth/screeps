import {Process} from '../ROS/process'
import {SpawnsHelper} from '../helpers/spawns'

// META
// room
// target
// flag
// global.OS.kernel.addProcess('intershardBuilder', {room: 'W51S31', target: 'W59S39', flag: '123'}, 0)
export class IntershardBuilder extends Process
{

    private init()
    {
        this.meta.last = 0;
        this.meta.initialized = true;
    }

    public run()
    {
        this.state = 'killed';
        if(!this.meta.initialized) {
            this.init();
        }
        const room = Game.rooms[this.meta.room];
        const flag = Game.flags[this.meta.flag];
        const creep = Game.creeps[this.meta.creep];

        if(room && flag) {
            if((!this.meta.creep || !creep) && this.meta.last + 300 < Game.time) {
                if(SpawnsHelper.spawnAvailable(room)) {
                    const name = SpawnsHelper.spawnCreep(room, [
                        WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE
                    ], {role: 'isBuilder'}, 'IB_'+this.meta.target);
                    if(name) {
                        this.meta.creep = name;
                    }
                }
            }
            else if(creep && creep.spawning) {

            }
            else if(creep) {
                this.handleBuilder(creep, flag);
            }
        }
        else {
            this.state = 'killed';
        }
    }

    private handleBuilder(creep: Creep, flag: Flag)
    {
        if(creep.room.name === this.meta.room && creep.carry[RESOURCE_ENERGY] === 0) {
            if(creep.room.storage && creep.room.storage.store[RESOURCE_ENERGY] > creep.carryCapacity) {
                if(creep.withdraw(creep.room.storage, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(creep.room.storage);
                }
            }
        }
        else {
            if(!creep.pos.isEqualTo(flag)) {
                creep.moveTo(flag);
            }
            else {
                this.meta.last = Game.time;
            }
        }
    }
}

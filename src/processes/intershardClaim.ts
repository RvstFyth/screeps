import {Process} from '../ROS/process'
import {SpawnsHelper} from '../helpers/spawns'


// META
// room
// target
// flag
// global.OS.kernel.addProcess('intershardClaim', {room: 'W51S31', target: 'W59S39', flag: '123'}, 0)
export class IntershardClaim extends Process
{

    private init()
    {
        this.meta.initialized = true;
    }

    public run()
    {
        this.state = 'killed';
        if(typeof this.meta.initialized === 'undefined') {
            this.init();
        }

        if(Game.flags[this.meta.flag])  {
            const creep = Game.creeps[this.meta.creep];
            const room = Game.rooms[this.meta.room];
            if(!this.meta.creep || !creep) {
                if(SpawnsHelper.spawnAvailable(room)) {
                    //SpawnsHelper.requestSpawn(this.ID, room, [CLAIM,MOVE], {role: 'intershardClaimer'}, 'creep');
                    const name = SpawnsHelper.spawnCreep(room, [CLAIM,MOVE], {role: 'isClaimer'}, 'IC_'+this.meta.target);
                    if(name) {
                        this.meta.creep = name;
                    }
                }
            }
            else if(creep && creep.spawning) {

            }
            else if(creep) {
                if(!creep.pos.isEqualTo(Game.flags[this.meta.flag])) {
                    creep.moveTo(Game.flags[this.meta.flag]);
                }
            }
            else if(this.meta.creep && !creep) {
                this.state = 'killed';
            }
        }
        else {
            this.state = 'killed';
        }
    }
}

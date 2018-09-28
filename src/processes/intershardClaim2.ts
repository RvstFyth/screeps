import {Process} from '../ROS/process'
import {SpawnsHelper} from '../helpers/spawns'

// META
// creep
// target
export class IntershardClaim2 extends Process
{
    private init()
    {

    }

    public run()
    {
        const creep = Game.creeps[this.meta.creep];
        if(creep) {
            if(creep.room.name !== this.meta.target) {
                creep.moveToRoom(this.meta.target);
            }
            else if(creep.room.controller) {
                if(!creep.pos.isNearTo(creep.room.controller)) {
                    creep.moveTo(creep.room.controller);
                }
                else {
                    creep.signController(creep.room.controller, "External cookie factory");
                    creep.claimController(creep.room.controller);
                    creep.suicide();
                }
            }
        }
        else {
            this.state = 'killed';
        }
    }
}

import {Process} from '../ROS/process'
import {SpawnsHelper} from '../helpers/spawns'

// META: room, creep, target
export class AttackController extends Process
{

    public run()
    {
        try {
            this.run2();
        }
        catch(e) {
            console.log("Error in AttackController: "+e.message);
        }
    }

    private run2()
    {
        if(typeof this.meta.last === 'undefined') {
            this.meta.last = 0;
        }
        const room = Game.rooms[this.meta.room];
        const creep = Game.creeps[this.meta.creep];
        if(room) {
            if(!creep && (this.meta.last === 0 || this.meta.last + 600 < Game.time)) {
                if(SpawnsHelper.spawnAvailable(room)) {
                    SpawnsHelper.requestSpawn(this.ID, room, [
                        CLAIM,CLAIM,CLAIM,CLAIM,CLAIM,CLAIM,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE
                    ], {role: 'controllerAttacker'}, 'creep');
                }
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

    handleCreep(creep: Creep)
    {
        if(creep.room.name !== this.meta.target) {
            creep.moveToRoom(this.meta.target);
        }
        else {
            if(Game.time % 3 === 0) {
                creep.say('#overlords', true);
            }
            if(creep.room.controller) {
                if(!creep.pos.isNearTo(creep.room.controller)) {
                    creep.moveTo(creep.room.controller);
                }
                else {
                    creep.signController(creep.room.controller, '#overlords');
                    if(creep.room.controller.level > 0) {
                        if(creep.attackController(creep.room.controller) === OK) {
                            this.meta.last = Game.time;
                            creep.say('P#wned!', true);
                            creep.suicide();
                        }
                    }
                    else {
                        this.state = 'killed';
                    }
                }
            }
        }
    }
}

import {Process} from "../ROS/process";
import {SpawnsHelper} from "../helpers/spawns";

export class ClaimController extends Process
{


    public run()
    {
        const claimer = Game.creeps[this.meta.creep];
        const room = Game.rooms[this.meta.room];
        const targetRoom = Game.rooms[this.meta.target];

        if(!room || (targetRoom && targetRoom.controller && targetRoom.controller.my)) {
            if(claimer) {
                claimer.suicide();
            }
            else {
                this.state = 'killed';
            }
        }
        else {
            this.handleCreep(claimer, room);
        }
    }

    private handleCreep(creep: Creep, room: Room)
    {
        if(!creep) {
            SpawnsHelper.requestSpawn(this.ID, room, [CLAIM,MOVE],{role: 'claimer'}, 'creep');
        }
        else if(creep && creep.spawning) {}
        else if(creep) {
            if(creep.room.name !== this.meta.target) {
                creep.moveToRoom(this.meta.target, true, true);
            }
            else {
                if(creep.room.controller) {
                    if(creep.pos.isNearTo(creep.room.controller)) {
                        creep.say('#overlords');
                        creep.claimController(creep.room.controller);
                    }
                    else {
                        creep.moveTo(creep.room.controller, {maxRooms: 1});
                    }
                }
            }
        }
    }
}

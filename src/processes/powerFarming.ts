import {Process} from "../ROS/process";
import {SpawnsHelper} from "../helpers/spawns";
import {PowerAttacker} from "../roles/powerAttacker";
import {PowerHealer} from "../roles/powerHealer";

export class PowerFarming extends Process
{
    /**
     * META:
     * room
     * targetRoom
     * powerAmount
     */

    public run()
    {
        const room = Game.rooms[this.meta.room];
        if(room) {

        }
        else {
            this.state = 'killed';
        }
    }

    private handleCreeps(room: Room)
    {
        const attacker = Game.creeps[this.meta.attacker];
        const healer = Game.creeps[this.meta.healer];

        if(!attacker) {
            SpawnsHelper.requestSpawn(this.ID, room, PowerAttacker.defineBodyParts(), {role: 'powerAttacker'}, 'attacker');
        }
        else if(attacker && attacker.spawning) {}
        else if(attacker) {
            PowerAttacker.run(attacker);
        }

        if(!healer) {
            SpawnsHelper.requestSpawn(this.ID, room, PowerHealer.defineBodyParts(), {role: 'powerHealer'}, 'healer');
        }
        else if(healer && healer.spawning) {}
        else if(healer) {
            PowerHealer.run(healer);
        }
    }
}

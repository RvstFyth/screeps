import { Process } from "ROS/process";
import { BoostsHelper } from "helpers/boosts";

export class Chemist extends Process
{
    public run()
    {
        const room = Game.rooms[this.meta.room];
        const creep = Game.creeps[this.meta.creep];
        if(room) {
            if(!this.meta.boostToCreate) {
                this.meta.boostToCreate = BoostsHelper.defineBoostToCreate(room);
            }
            if(creep) {
                creep.pos.getRangeTo
            }
        }
        else {
            this.state = 'killed';
        }
    }
}

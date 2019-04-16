import { Process } from "ROS/process";
import { Drainer } from "roles/drainer"
import { SpawnsHelper } from "helpers/spawns";

export class DrainRoom extends Process
{

    /**
     * TOUGH parts should always be T3 boosted.
     * 6 towers do 3600 damage total, T3 boosted TOUGH only takes 30% damage from that
     * 3600 * 0.3 = 1080
     */

    public run()
    {
        const room = Game.rooms[this.meta.room];

        if(room) {
            if(!this.meta.creeps) {
                this.meta.creeps = [];
            }

            for(let n in this.meta.creeps) {
                if(!Game.creeps[this.meta.creeps[n]]) {
                    this.meta.creeps[n] = null;
                }
                else if(Game.creeps[this.meta.creeps[n]].spawning) {

                }
                else if (Game.creeps[this.meta.creeps[n]]) {
                    if(Game.creeps[this.meta.creeps[n]].memory.boosted) {
                        Drainer.run(Game.creeps[this.meta.creeps[n]],this.meta.target);
                    }
                    else {
                        Game.creeps[this.meta.creeps[n]].boost({

                        });
                    }
                }
            }

            this.meta.creeps = this.meta.creeps.filter((n: any) => n); // Remove NULL values

            // TODO: Spawn block
            let numCreeps = 1;
            if(this.meta.creeps.length < numCreeps) {
                SpawnsHelper.requestSpawn(this.ID, room, [

                ], {role: 'drainer'}, 'creeps[]');
            }
        }
        else {
            this.state = 'killed';
        }
    }


}

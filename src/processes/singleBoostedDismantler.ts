import {Process} from '../ROS/process'
import {SpawnsHelper} from '../helpers/spawns'

// META: room, target, targetWall
export class SingleBoostedDismantler extends Process
{

    private init()
    {
        this.meta.boosted = false;
        this.meta.initialized = true;
    }

    public run()
    {
        const room = Game.rooms[this.meta.room];

        if(typeof this.meta.initialized === 'undefined') {
            this.init();
        }

        if(room) {
            const creep = Game.creeps[this.meta.creep];
            if(!this.meta.creep || !creep) {
                if(SpawnsHelper.spawnAvailable(room)) {
                    SpawnsHelper.requestSpawn(this.ID, room, [
                        TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,MOVE,MOVE,MOVE,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,MOVE,MOVE,MOVE
                    ], {role: 'singleBoostedDismantler'}, 'creep');
                }
            }
            else if(creep && creep.spawning) {

            }
            else if(creep) {
                if(!this.meta.boosted) {
                    this.boost(creep);
                }
                else {
                    this.handleCreep(creep);
                }
            }
        }
        else {
            this.state = 'killed';
        }
    }

    private handleCreep(creep: Creep)
    {
        if(creep.room.name !== this.meta.target) {
            creep.moveToRoom(this.meta.target);
        }
        else {
            if(!this.meta.targetWall) {
                // Define target wall with code.. TODO
            }
            if(this.meta.targetWall) {
                const wall: StructureWall|null = Game.getObjectById(this.meta.targetWall);
                if(wall) {
                    if(!creep.pos.isNearTo(wall)) {
                        creep.moveTo(wall);
                    }
                    else {
                        creep.dismantle(wall);
                    }
                }
                else {
                    // Should mean we have access to the room :D
                }
            }
        }
    }

    private boost(creep: Creep)
    {

    }
}

import {Process} from '../ROS/process'
import {SpawnsHelper} from '../helpers/spawns'


export class SourceKeeperAttacker extends Process
{


    public run()
    {
        const room = Game.rooms[this.meta.room];
        if(room) {
            this.handleCreep(room);
        }
        else {
            this.state = 'killed';
        }
    }

    private handleCreep(room: Room)
    {
        const creep = Game.creeps[this.meta.creep];
        if(!this.meta.creep || !creep) {
            if(SpawnsHelper.spawnAvailable(room)) {
                SpawnsHelper.requestSpawn(this.ID, room,
                    [TOUGH,TOUGH,TOUGH,TOUGH,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,HEAL,HEAL,HEAL,HEAL,HEAL],
                    {role: 'skAttacker'}, 'creep')
            }
        }
        else if(creep && creep.spawning) {

        }
        else if(creep) {
            if(creep.room.name !== this.meta.target) {
                creep.moveToRoom(this.meta.target);
            }
            else {
                const hostiles = creep.room.find(FIND_HOSTILE_CREEPS);
                if(hostiles.length) {
                    const target = creep.pos.findClosestByRange(hostiles);
                    const res = creep.attack(target);
                    if(res === ERR_NOT_IN_RANGE) {
                        creep.moveTo(target);
                    }
                    if(res !== OK && creep.hits < creep.hitsMax) {
                        creep.heal(creep);
                    }
                }
                else {
                    if(creep.hits < creep.hitsMax) {
                        creep.heal(creep);
                    }
                }
            }
        }
    }
}

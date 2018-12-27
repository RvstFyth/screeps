import {Process} from '../ROS/process'
import {SpawnsHelper} from '../helpers/spawns'


export class SourceKeeperAttacker extends Process
{

    public run()
    {
        try {
            this.run2();
        }
        catch(e) {
            console.log(`Error in SourceKeeperAttacker: ${e.message}`);
        }
    }

    public run2()
    {
        this.state = 'killed';

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
                    //[TOUGH,TOUGH,TOUGH,TOUGH,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,HEAL,HEAL,HEAL,HEAL,HEAL],
                    [TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,HEAL,HEAL,HEAL,HEAL,HEAL],
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
                    const hostilesInRange = creep.pos.findInRange(hostiles, 3);

                    // Ranged or massRanged
                    if(hostilesInRange && hostilesInRange.length > 1) {
                        creep.rangedMassAttack();
                    }
                    else if(target && creep.pos.inRangeTo(target, 3)) {
                        creep.rangedAttack(target);
                    }
                    // Attack or heal
                    if(target && creep.pos.isNearTo(target)) {
                        creep.attack(target);
                    }
                    else {
                        creep.heal(creep);
                        if(target) {
                            if(creep.hits === creep.hitsMax || creep.pos.inRangeTo(target, 3)) {
                                creep.moveTo(target);
                            }
                        }
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

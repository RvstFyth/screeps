import {Process} from 'ROS/process';
import { CreepsHelper } from 'helpers/creeps';
import { SpawnsHelper } from 'helpers/spawns';

export class AlliDefender extends Process
{

    public run()
    {
        const room = Game.rooms[this.meta.room];
        // this.state = 'killed';
        if(room && room.controller && room.controller.my) {
            const creep = CreepsHelper.getCreep(this.meta.creep);
            if(!creep) {
                SpawnsHelper.requestSpawn(this.ID, room, [ // 15M 10RA 5H
                    MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,MOVE,MOVE,MOVE,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,HEAL,HEAL,HEAL,HEAL,HEAL
                ], {role: 'alliDefender'}, 'creep');
            }
            else if(creep && creep.spawning) {

            }
            else if(creep) {
                this.handleCreep(creep);
            }
        }
    }

    private handleCreep(creep: Creep)
    {
        if(creep.room.name !== this.meta.target) {
            creep.moveToRoom(this.meta.target);
            creep.heal(creep);
            const hostilesInRange = creep.pos.findInRange(creep.room.hostiles, 3);
            if(hostilesInRange.length) {
                creep.rangedAttack(hostilesInRange[0]);
            }
        }
        else {if(creep.pos.x === 0) creep.move(RIGHT);
            else if(creep.pos.x === 49) creep.move(LEFT);
            else if(creep.pos.y === 0) creep.move(BOTTOM);
            else if(creep.pos.y === 49) creep.move(TOP);
            else if(creep.room.hostiles.length) {
                const hostiles = creep.room.hostiles.filter((c: Creep) => creep.pos.x !== 0 && creep.pos.y !== 0 && creep.pos.x !== 49 && creep.pos.y !== 49);
                if(hostiles.length) {
                    const target: Creep| null = creep.pos.findClosestByRange(hostiles);
                    if(target && creep.rangedAttack(target) === ERR_NOT_IN_RANGE) {
                        creep.moveTo(target, {maxRooms: 1});
                    }
                    if(target) {
                        if(creep.pos.inRangeTo(target, 3)) {
                            if(creep.rangedAttack(target) === ERR_NOT_IN_RANGE) creep.moveTo(target, {maxRooms: 1});
                        }
                        //creep.flee(hostiles, 3);
                    }
                }
                else {
                    // Consumes too much CPU for now
                    // const damagedAllies = creep.room.allies.filter((c: Creep) => c.hits < c.hitsMax && creep.room.findPath(creep.pos, c.pos, {maxRooms: 1}).length);
                    // if(damagedAllies.length) {
                    //     const closest = creep.pos.findClosestByRange(damagedAllies);
                    //     if(closest && creep.heal(closest) === ERR_NOT_IN_RANGE) creep.moveTo(closest);
                    // }
                }
            }
            else {
                //if(creep.pos.x == 0 || creep.pos.y == 0 || creep.pos.x == 49 || creep.pos.x == 0) {
                    //if(creep.room.controller) {
                        // const res = creep.moveTo(new RoomPosition(25,25, creep.room.name), {range: 22, maxRooms: 1});
                        // console.log(res)
                    //}
                //}
            }
            creep.heal(creep);
        }
    }
}

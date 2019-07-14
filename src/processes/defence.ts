import {Process} from '../ROS/process';
import {SpawnsHelper} from '../helpers/spawns';
import {DefenderRanger} from '../roles/defenderRanger';

export class Defence extends Process
{

    run()
    {
        try{
            this.run2();
        }
        catch(e) {
            console.log(`Defence process crashed :/ ${e.message}`);
        }
    }

    run2()
    {
        if(typeof this.meta.targetRoom === 'undefined') {
            this.meta.targetRoom = this.meta.room
        }
        if(typeof this.meta.shouldRenew === 'undefined') {
            this.meta.shouldRenew = false;
        }

        const room = Game.rooms[this.meta.room];
        const creep = Game.creeps[this.meta.creep];
        const shouldSpawn = room.storage && room.storage.store[RESOURCE_ENERGY] > 40000;

        if(room && room.controller && room.controller.my) {
            if(shouldSpawn && !creep && room.energyAvailable === room.energyCapacityAvailable) {
                this.meta.shouldRenew = false;
                if(SpawnsHelper.spawnAvailable(room)) {
                    SpawnsHelper.requestSpawn(this.ID, room, [
                        RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,
                        MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,
                        RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,HEAL,HEAL,
                        HEAL,HEAL,HEAL
                    ], {role: 'roomDefender'}, 'creep');
                }
            }
            else if(creep && creep.spawning) {

            }
            else if(creep) {
                if(!room.hostiles.length && this.meta.targetRoom === this.meta.room) {
                    // Nothing to do in the core rome, check if there is a remote under attack!
                    for(let i in Memory.attackedRemotes) {
                        if(Memory.attackedRemotes[i] <= 2) {
                            if(Memory.remotes[room.name] && Memory.remotes[room.name][i]) {
                                this.meta.targetRoom = i;
                                break;
                            }
                        }
                    }
                }
                if(creep.room.name !== this.meta.room && creep.room.name === this.meta.targetRoom && !creep.room.hostiles.length) {
                    this.meta.targetRoom = this.meta.room;
                }
                if(!Memory.attackedRemotes[this.meta.targetRoom]) {
                    this.meta.targetRoom = this.meta.room;
                }
                if(!this.meta.shouldRenew && creep.ticksToLive && creep.ticksToLive < 600) {
                    this.meta.shouldRenew = true;
                }
                if(this.meta.shouldRenew && creep.ticksToLive && creep.ticksToLive >= 1300) {
                    this.meta.shouldRenew = false;
                }
                if(this.meta.shouldRenew && !creep.room.hostiles.length) {
                    if(creep.room.name !== this.meta.room) {
                        creep.moveToRoom(this.meta.room);
                    }
                    else {
                        const spawns = SpawnsHelper.getAvailableSpawns(room);
                        if(spawns.length) {
                            if(spawns[0].renewCreep(creep) === ERR_NOT_IN_RANGE) {
                                creep.moveTo(spawns[0]);
                            }
                        }
                        else {
                            if(creep.room.spawns.length && !creep.pos.inRangeTo(creep.room.spawns[0], 4)) {
                                creep.moveTo(creep.room.spawns[0]);
                            }
                        }
                    }
                }
                else {
                    DefenderRanger.run(creep, room, this.meta.targetRoom);
                }
            }
        }
        else {
            this.state = 'killed';
        }
    }
}

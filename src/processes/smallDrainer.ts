import {Process} from '../ROS/process';
import {SpawnsHelper} from '../helpers/spawns';

// META:  room, target
export class SmallDrainer extends Process
{

    private init()
    {
        this.meta.done = false;
        if(!this.meta.creep) {
            this.meta.creep = '';
        }
        this.meta.initialized = true;
    }

    run()
    {
        if(this.ID === 3721 && !Game.creeps[this.meta.creep])  {
            this.state = 'killed';
        }
        if(typeof this.meta.initialized === 'undefined') {
            this.init();
        }
        if(typeof this.meta.flee === 'undefined') {
            this.meta.flee = false;
        }
        const room = Game.rooms[this.meta.room];
        const creep = Game.creeps[this.meta.creep];

        if(room) {
            this.handleCreep(creep, room);
        }
        else {
            this.state = 'killed';
        }
    }

    private handleCreep(creep: Creep, room: Room)
    {
        if(!creep && !this.meta.done) {
            SpawnsHelper.requestSpawn(this.ID, room, [ // 25M 5RA 20H costs: 7k
                MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL
            ], {role: 'smallDrainer'}, 'creep')
        }
        else if(creep && creep.spawning) {

        }
        else if(creep) {
            if(creep.room.name !== this.meta.target) {
                if(!this.meta.flee) {
                    creep.moveToRoom(this.meta.target);
                }
                else if(this.meta.flee && Game.flags['drain']) {
                    creep.moveTo(Game.flags['drain']);
                    if(creep.hits === creep.hitsMax) {
                        this.meta.flee = false;
                    }
                }
                creep.heal(creep);
            }
            else {
                const shouldFlee = creep.hits < creep.hitsMax * 0.8;
                if(shouldFlee || this.meta.flee) {
                    creep.moveTo(this.meta.room);
                }
                else if(creep.hits === creep.hitsMax) {
                    const towers = creep.room.towers.filter((t: StructureTower) => t.energy >= 10);
                    if(!towers.length) {
                        if(creep.room.hostiles.length && creep.getActiveBodyparts(RANGED_ATTACK) > 0) {
                            const target = creep.pos.findClosestByRange(creep.room.hostiles);
                            if(target) {
                                if(creep.pos.inRangeTo(target, 3)) {
                                    const hostilesInRange = creep.pos.findInRange(creep.room.hostiles, 3);
                                    if(hostilesInRange.length > 1) {
                                        creep.rangedMassAttack();
                                    }
                                    else {
                                        creep.rangedAttack(target);
                                    }
                                }
                            }
                        }
                        else if(creep.getActiveBodyparts(RANGED_ATTACK) === 0) {
                            creep.moveToRoom(this.meta.room);
                        }
                        else {
                            let target;
                            if(creep.room.towers.length) {
                                target = creep.pos.findClosestByRange(creep.room.towers);
                            }
                            else if(creep.room.spawns.length) {
                                target = creep.pos.findClosestByRange(creep.room.spawns);
                            }
                            else if(creep.room.extensions.length) {
                                target = creep.pos.findClosestByRange(creep.room.extensions);
                            }

                            if(target) {
                                if(creep.rangedAttack(target) === ERR_NOT_IN_RANGE) {
                                    creep.moveTo(target);
                                }
                            }
                            else {
                                // this.meta.done = true;
                                // Spawn a looting process??
                            }
                        }
                    }
                    else {
                        if(!shouldFlee && Game.flags['drain2']) {
                            creep.moveTo(Game.flags['drain2']);
                        }
                        else if(!shouldFlee && Game.flags['drain3']) {
                            creep.moveTo(Game.flags['drain3']);
                        }
                        else {
                            creep.moveToRoom(this.meta.room);
                        }
                    }
                }
                else {
                    this.meta.flee = true;
                }
            }
            const damagedCreeps = creep.pos.findInRange(FIND_MY_CREEPS, 1, {
                filter: (c: Creep) => c.hits < c.hitsMax
            });
            if(damagedCreeps.length && creep.hits === creep.hitsMax) {
                creep.heal(damagedCreeps[0]);
            }
            else {
                creep.heal(creep);
            }
        }
        else {
            // State killed?
        }
    }
}

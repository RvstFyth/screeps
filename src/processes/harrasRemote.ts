import {Process} from '../ROS/process'
import {SpawnsHelper} from '../helpers/spawns'

// META
// room
// target
// global.OS.kernel.addProcess('harrasRemote', {room: 'W51S32', target: "W51S31"}, 0)
export class HarrasRemote extends Process
{

    init()
    {
        this.meta.creeps = [];
        this.meta.initialized = true;
    }

    run()
    {
        this.state = 'killed';
        try {
            this.run2();
        }
        catch(e) {
            console.log('<span style="color:red">'+e.name+' : ' +e.message+'</span> | '+e.fileName+':'+e.lineNumber);
            // console.log(JSON.stringify(e));
        }
    }

    run2()
    {
        const room = Game.rooms[this.meta.room];
        if(typeof this.meta.initialized === 'undefined') {
            this.init();
        }

        if(room) {
            this.meta.waypoint = !!Game.flags[this.ID];
            this.handleCreeps(room);
        }
        else {
            this.state = 'killed';
        }
    }

    handleCreeps(room: Room)
    {
        for(let i in this.meta.creeps) {
            if(!Game.creeps[this.meta.creeps[i]]) {
                this.meta.creeps[i] = null;
            }
            else if(Game.creeps[this.meta.creeps[i]] && Game.creeps[this.meta.creeps[i]].spawning) {

            }
            else if(Game.creeps[this.meta.creeps[i]]) {
                this.handleHarrasser(Game.creeps[this.meta.creeps[i]]);
                const remainingTTL = Game.creeps[this.meta.creeps[i]].ticksToLive;
                if(remainingTTL && remainingTTL <= 500 && this.meta.creeps.length < 2) {
                    if(SpawnsHelper.spawnAvailable(room)) {
                        const bodyParts: BodyPartConstant[] = [ // 3290 energy
                            //MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,ATTACK,ATTACK,ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,HEAL,HEAL,HEAL];
                            MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,ATTACK,ATTACK,ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,HEAL,HEAL,HEAL,HEAL,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE];
                        SpawnsHelper.requestSpawn(this.ID, room,bodyParts,{role: 'remoteHarrasser'}, 'creeps[]');
                    }
                }
            }
        }

        this.meta.creeps = this.meta.creeps.filter((c: any) => c);
        if(this.meta.creeps.length < 1) {
            if(SpawnsHelper.spawnAvailable(room)) {
                const bodyParts: BodyPartConstant[] = [ // 3290 energy
                    MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,ATTACK,ATTACK,ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,HEAL,HEAL,HEAL];
                    //MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,ATTACK,ATTACK,ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,HEAL,HEAL,HEAL,HEAL,HEAL,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE];
                SpawnsHelper.requestSpawn(this.ID, room,bodyParts,{role: 'remoteHarrasser'}, 'creeps[]');
            }
        }
    }

    handleHarrasser(creep: Creep)
    {

        if(creep.hits < (creep.hitsMax / 4) * 3) {
            creep.heal(creep);
        }

        if(typeof creep.memory.arrived === 'undefined') {
            creep.memory.arrived = false;
        }

        if(creep.room.name !== this.meta.target) {
            let healed = false;
            if(creep.hits < creep.hitsMax) {
                creep.heal(creep);
                healed = true;
            }
            let hostiles = creep.pos.findInRange(creep.room.hostiles, 1);
            if(hostiles.length) {
                if(healed && creep.getActiveBodyparts(RANGED_ATTACK) > 0) {
                    creep.rangedAttack(hostiles[0]);
                }
                else {
                    if(!healed && creep.getActiveBodyparts(ATTACK) > 0) {
                        creep.attack(hostiles[0]);
                    }
                    if(creep.getActiveBodyparts(RANGED_ATTACK) > 0) {
                        creep.rangedAttack(hostiles[0]);
                    }
                }
            }
            if(this.meta.waypoint && !creep.memory.arrived) {
                if(!creep.pos.isNearTo(Game.flags[this.ID])) {
                    creep.moveTo(Game.flags[this.ID]);
                }
                else {
                    creep.memory.arrived = true;
                }
            }
            else {
                creep.moveToRoom(this.meta.target);
            }
        }
        else {
            if(Game.time % 5 === 0) {
                creep.say('#overlords', true);
            }
            if(Game.time % 9 === 0 && creep.room.allies.length) {
                creep.say(`Hi ${creep.room.allies[0].owner.username}! :)`);
            }
            // if(creep.room.controller && creep.room.controller.reservation && creep.room.controller.reservation.username !== 'GimmeCookies') {
            //     if(creep.room.controller.reservation.ticksToEnd < 150) {
            //         if(!global.OS.kernel.hasProcessForNameAndMetaKeyValue('reserveRoom', 'target', this.meta.target)) {
            //             global.OS.kernel.addProcess('reserveRoom', {target: this.meta.target}, this.ID);
            //         }
            //     }
            // }
            if(creep.room.hostiles.length) {

                const reserver = creep.room.hostiles.filter((c: Creep) => c.getActiveBodyparts(CLAIM));
                const filteredDefenders: Creep[] =
                creep.room.hostiles.filter((c: Creep) => (c.getActiveBodyparts(RANGED_ATTACK) || c.getActiveBodyparts(ATTACK) || c.getActiveBodyparts(HEAL)) &&
                    c.pos.x !== 0 && c.pos.x !== 49 && c.pos.y !== 0 && c.pos.y !== 49
                );

                if(reserver.length) {
                    this.harrasserAttack(creep, reserver[0]);
                }

                else if(filteredDefenders.length) {
                    const target: Creep = creep.pos.findClosestByRange(filteredDefenders);
                    this.harrasserAttack(creep, target);
                }
                else {
                    const target: Creep = creep.pos.findClosestByRange(creep.room.hostiles.filter((c: Creep) => (!c.getActiveBodyparts(RANGED_ATTACK) && !c.getActiveBodyparts(ATTACK) && !c.getActiveBodyparts(HEAL)) && c.pos.x !== 0 && c.pos.x !== 49 && c.pos.y !== 0 && c.pos.y !== 49));
                    if(target) {
                        this.harrasserAttack(creep, target);
                    }
                    else {
                        // const structures: Structure[] = creep.room.roads;
                        // if(structures.length) {
                        //     const target = creep.pos.findClosestByRange(structures);
                        //     this.harrasserAttack(creep, target);
                        // }
                        const allies = creep.room.allies.filter((c: Creep) => c.hits < c.hitsMax);
                        if(allies.length) {
                            const closest = creep.pos.findClosestByRange(allies);
                            // creep.moveTo(closest);
                            if(creep.heal(closest) === ERR_NOT_IN_RANGE) {
                                if(creep.rangedHeal(closest) === ERR_NOT_IN_RANGE) {
                                    creep.moveTo(closest)
                                }
                            }
                        }
                        else {
                            const inRange = creep.pos.findInRange(creep.room.hostiles, 3);
                            if(inRange.length) {
                                creep.rangedAttack(inRange[0]);
                            }
                        }
                    }
                }
            }
            else {
                //const structures: Structure[] = creep.room.containers;
                const structures: Structure[] = []; //creep.room.find(FIND_STRUCTURES, {filter: (r: Structure) => r.structureType === STRUCTURE_ROAD /*|| r.structureType === STRUCTURE_CONTAINER*/});
                if(structures.length) {
                    const target = creep.pos.findClosestByRange(structures);
                    this.harrasserAttack(creep, target);
                }
                else {
                    const allies = creep.room.allies.filter((c: Creep) => c.hits < c.hitsMax);
                    if(creep.hits < creep.hitsMax) {
                        creep.heal(creep);
                    }
                    else {
                        if(allies.length) {
                            const closest = creep.pos.findClosestByRange(allies);
                            // creep.moveTo(closest);
                            if(creep.heal(closest) === ERR_NOT_IN_RANGE) {
                                if(creep.rangedHeal(closest) === ERR_NOT_IN_RANGE) {
                                    creep.moveTo(closest)
                                }
                            }
                        }
                    }
                    if(allies.length) {
                        if(!creep.pos.isNearTo(allies[0])) {
                            creep.moveTo(allies[0]);
                        }
                    }
                    else {
                        const structures: Structure[] = creep.room.find(FIND_STRUCTURES, {filter: (r: Structure) => r.structureType === STRUCTURE_ROAD /*|| r.structureType === STRUCTURE_CONTAINER*/});
                        if(structures.length) {
                            const target = creep.pos.findClosestByRange(structures);
                            this.harrasserAttack(creep, target);
                        }
                    }
                    // else if(creep.room.controller) {
                    //     if(!creep.pos.isNearTo(creep.room.controller)) {
                    //         creep.moveTo(creep.room.controller);
                    //     }
                    //     else {
                    //         if(creep.room.controller.sign && creep.room.controller.sign.username !== 'GimmeCookies') {
                    //             creep.signController(creep.room.controller, "#overlords");
                    //         }
                    //     }
                    // }
                }
            }
        }
    }

    harrasserAttack(creep: Creep, target: Creep|Structure, flee:boolean = false)
    {
        if(target.pos) {
            if(!creep.pos.isNearTo(target)) {
                creep.moveTo(target);
                if(creep.pos.inRangeTo(target.pos.x, target.pos.y, 3) && creep.getActiveBodyparts(RANGED_ATTACK) > 0) {
                    creep.rangedAttack(target);
                }
                else {
                    // creep.rangedMassAttack();
                }
                if(creep.hits < creep.hitsMax) {
                    creep.heal(creep);
                }
                else {
                    const allies = creep.pos.findInRange(creep.room.allies, 3).filter((c: Creep) => c.hits < c.hitsMax);
                    if(allies.length) {
                        const closest = creep.pos.findClosestByRange(allies);
                        if(creep.pos.isNearTo(closest)) {
                            creep.heal(closest);
                        }
                        else {
                            creep.rangedHeal(closest);
                        }
                    }
                }
            }
            else {
                if(creep.getActiveBodyparts(ATTACK) > 0) {
                    creep.attack(target);
                    if(creep.getActiveBodyparts(RANGED_ATTACK) > 0) {
                        creep.rangedAttack(target);
                    }
                }
                else if(creep.getActiveBodyparts(RANGED_ATTACK) > 0) {
                    creep.rangedAttack(target);
                    if(creep.hits < creep.hitsMax) {
                        creep.heal(creep);
                    }
                    else {
                        const allies = creep.pos.findInRange(creep.room.allies, 1).filter((c: Creep) => c.hits < c.hitsMax);
                        if(allies.length) {
                            creep.heal(allies[0]);
                        }
                    }
                }
                else {
                    if(creep.hits < creep.hitsMax) {
                        creep.heal(creep);
                    }
                    else {
                        const allies = creep.pos.findInRange(creep.room.allies, 3).filter((c: Creep) => c.hits < c.hitsMax);
                        if(allies.length) {
                            const closest = creep.pos.findClosestByRange(allies);
                            if(creep.pos.isNearTo(closest)) {
                                creep.heal(closest);
                            }
                            else {
                                creep.rangedHeal(closest);
                            }
                        }
                    }
                }
            }
        }
    }
}

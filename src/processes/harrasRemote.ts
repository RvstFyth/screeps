import {Process} from '../ROS/process'
import {SpawnsHelper} from '../helpers/spawns'

// META
// room
// target
// global.OS.kernel.addProcess('harrasRemote', {room: 'W59S21', target: "W59S17", creeps: ['434_11600948']}, 0)
// Multiple creeps support is important for pre-spawning
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
        // if(!this.meta.creeps['434_11600948']) {
        //     this.meta.creeps.push('434_11600948');
        // }
        const room = Game.rooms[this.meta.room];
        if(typeof this.meta.initialized === 'undefined') {
            this.init();
        }

        if(room) {
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
                if(remainingTTL && remainingTTL <= 300 && this.meta.creeps.length < 2) {
                    if(SpawnsHelper.spawnAvailable(room)) {
                        const bodyParts: BodyPartConstant[] = [ // 3290 energy
                            MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,ATTACK,ATTACK,ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,HEAL,HEAL,HEAL,HEAL,HEAL,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE];
                        SpawnsHelper.requestSpawn(this.ID, room,bodyParts,{role: 'remoteHarrasser'}, 'creeps[]');
                    }
                }
            }
        }

        this.meta.creeps = this.meta.creeps.filter((c: any) => c);
        if(this.meta.creeps.length < 1) {
            if(SpawnsHelper.spawnAvailable(room)) {
                const bodyParts: BodyPartConstant[] = [ // 3290 energy
                    MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,ATTACK,ATTACK,ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,HEAL,HEAL,HEAL,HEAL,HEAL,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE];
                SpawnsHelper.requestSpawn(this.ID, room,bodyParts,{role: 'remoteHarrasser'}, 'creeps[]');
            }
        }
    }

    handleHarrasser(creep: Creep)
    {

        if(creep.hits < (creep.hitsMax / 4) * 3) {
            creep.heal(creep);
        }

        if(creep.room.name !== this.meta.target) {
            creep.moveToRoom(this.meta.target);
        }
        else {
            if(Game.time % 5 === 0) {
                creep.say('#overlords', true);
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
                creep.room.hostiles.filter((c: Creep) => (c.getActiveBodyparts(RANGED_ATTACK) || c.getActiveBodyparts(ATTACK) || c.getActiveBodyparts(HEAL) &&
                    c.pos.x < 39 && c.pos.x > 10 && c.pos.y < 39 && c.pos.x > 10
                ));

                if(reserver.length) {
                    this.harrasserAttack(creep, reserver[0]);
                }

                else if(filteredDefenders.length) {
                    const target: Creep = creep.pos.findClosestByRange(filteredDefenders);
                    this.harrasserAttack(creep, target);
                }
                else {
                    const target: Creep = creep.pos.findClosestByRange(creep.room.hostiles.filter((c: Creep) => (!c.getActiveBodyparts(RANGED_ATTACK) && !c.getActiveBodyparts(ATTACK) && !c.getActiveBodyparts(HEAL))));
                    if(target) {
                        this.harrasserAttack(creep, target);
                    }
                    else {
                        const structures: Structure[] = creep.room.containers;
                        if(structures.length) {
                            const target = creep.pos.findClosestByRange(structures);
                            this.harrasserAttack(creep, target);
                        }
                    }
                }
            }
            else {
                //const structures: Structure[] = creep.room.containers;
                const structures: Structure[] = creep.room.find(FIND_STRUCTURES, {filter: (r: Structure) => r.structureType === STRUCTURE_ROAD || r.structureType === STRUCTURE_CONTAINER});
                if(structures.length) {
                    const target = creep.pos.findClosestByRange(structures);
                    this.harrasserAttack(creep, target);
                }
                else {
                    if(creep.hits < creep.hitsMax) {
                        creep.heal(creep);
                    }

                    if(creep.room.controller) {
                        if(!creep.pos.isNearTo(creep.room.controller)) {
                            creep.moveTo(creep.room.controller);
                        }
                        else {
                            if(creep.room.controller.sign && creep.room.controller.sign.username !== 'GimmeCookies') {
                                creep.signController(creep.room.controller, "#overlords");
                            }
                        }
                    }
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
                    creep.rangedMassAttack();
                }
                if(creep.hits < creep.hitsMax) {
                    creep.heal(creep);
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

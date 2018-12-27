import {Process} from '../ROS/process';
import {SpawnsHelper} from '../helpers/spawns';


export class SmallRangerDuo extends Process
{
    requiredBoosts: any = {}

    private init()
    {
        if(!this.meta.creeps) {
            this.meta.creeps = [];
        }
        this.meta.labs = [];
        this.meta.initialized = true;
        this.meta.boosted = false;
        this.meta.labsAreStocked = false;

        this.requiredBoosts[RESOURCE_CATALYZED_ZYNTHIUM_ALKALIDE] = 420;
        this.requiredBoosts[RESOURCE_CATALYZED_KEANIUM_ALKALIDE] = 360;
        this.requiredBoosts[RESOURCE_CATALYZED_GHODIUM_ALKALIDE] = 300;
        this.requiredBoosts[RESOURCE_CATALYZED_LEMERGIUM_ALKALIDE] = 600;
    }

    run()
    {
        if(!this.meta.initialized) {
            this.init();
        }

        const room = Game.rooms[this.meta.room];
        if(room && room.controller && room.controller.my) {
            if(!this.meta.creeps.length) {
                this.spawnCreeps(room);
            }
        }
        else {
            this.state = 'killed';
        }
    }

    private defineLabs(room: Room)
    {
        const labs = room.labs.filter((l: StructureLab) => l.memory.state !== global.LAB_STATE.SUPPLY);
        if(labs.length && labs.length >= 4) {
            const boosts = Object.keys(this.requiredBoosts);
            for(let i = 0; i < 4; i++) {
                labs[i].memory.state = global.LAB_STATE.BOOSTING;
                labs[i].memory.boost = boosts[i] as ResourceConstant;
                this.meta.labs.push(labs[i].id);
            }
        }
    }

    private stockLabs(room: Room)
    {
        const transporter = Game.creeps[this.meta.transporter];
        if(!transporter) {
            SpawnsHelper.requestSpawn(this.ID, room, [
                MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY
            ], {role: 'boostTransporter'}, 'transporter');
        }
        else if(transporter && transporter.spawning) {

        }
        else if(transporter) {
            if(!this.meta.labs.length) {
                this.defineLabs(room);
            }
            if(_.sum(transporter.carry) === 0) {
                transporter.memory.harvesting = true;
                transporter.memory.targetID = '';
                transporter.memory.target = '';
            }
            if(!transporter.memory.targetID) {
                let lab, mineral;
                for(let i in this.requiredBoosts) {
                    const labs = room.labs.filter((l: StructureLab) => l.mineralType === i && l.mineralAmount > 0);
                    if(!labs.length) {
                        const availableLabs = room.labs.filter((l: StructureLab) => this.meta.labs.indexOf(l.id) === -1);
                        mineral = i;
                        lab = availableLabs[0];
                    }
                }
                if(lab && mineral) {
                    transporter.memory.targetID = lab.id;
                    transporter.memory.target = mineral;
                }
                else {
                    this.meta.labsAreStocked = true;
                    transporter.memory.targetID = '';
                    transporter.memory.target = '';
                }
            }
            if(transporter.memory.harvesting && transporter.memory.targetID) {
                const lab = Game.getObjectById(transporter.memory.targetID);
                if(lab) {
                    if(room.storage || room.terminal) {
                        const sAmount = room.storage && room.storage.store[transporter.memory.target as ResourceConstant] || 0;
                        const tAmount = room.terminal && room.terminal.store[transporter.memory.target as ResourceConstant] || 0;
                    }
                }
                else {

                }
            }
        }
    }

    private spawnCreeps(room: Room)
    {
        this.meta.boosted = false;
        const availableSpawns = SpawnsHelper.getAvailableSpawns(room);
        if(availableSpawns.length > 1) {
            for(let i = 0; i < 2; i++) {
                const name = SpawnsHelper.spawnCreep(room, [ // 7M 6RA 10H 5T
                    TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL
                ], {role: 'smallRanger'}, '');
                if(name) {
                    this.meta.creeps.push(name);
                }
            }
        }
    }
}

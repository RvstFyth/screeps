import {Process} from '../ROS/process'
import {SpawnsHelper} from '../helpers/spawns'

// META: room, target, targetWall
// OS.kernel.addProcess('dismantleWall', {room: 'W51S31', target: 'W58S35', targetWall: '5bc616bc7d21e7597d46aef0'}, 0);
export class DismantleWall extends Process
{

    private init()
    {
        this.meta.healer = '';
        this.meta.dismantler = '';
        this.meta.hBoosted = false; // is healer boosted?
        this.meta.dBoosted = false; // is dismantler boosted?
        this.meta.hCurrent = 0;
        this.meta.dCurrent = 0;
        this.meta.initialized = true;
    }

    public run()
    {
        try {
            this.run2();
        }
        catch(e) {
            console.log("DismantleWall error: "+e.message);
        }
    }

    public run2()
    {
        // this.meta.target = 'W54S39';
        // this.meta.targetWall = '5bf84cacb4a5532a2db37788';
        // this.meta.done = false;
        this.state = 'killed';
        //this.meta.healer = '486_11251055';

        //  if(this.ID == 506) {
        //     this.meta.targetWall = '5bf84d5f57542e5b73d6e3c4';
        // }

        const room = Game.rooms[this.meta.room];
        const healer = Game.creeps[this.meta.healer];
        const dismantler = Game.creeps[this.meta.dismantler];
        if(dismantler && !dismantler.spawning && Game.flags[dismantler.name]) {
            dismantler.moveTo(Game.flags[dismantler.name]);
        }
        if(healer && !healer.spawning && Game.flags[healer.name]) {
            healer.moveTo(Game.flags[healer.name]);
        }
        if(typeof this.meta.done === 'undefined') {
            this.meta.done = false;
        }
        if(typeof this.meta.initialized === 'undefined') {
            this.init();
        }
        if(this.meta.done && !healer && !dismantler) {
            this.state = 'killed';
        }
        if(!healer) {
            if(typeof this.meta.done !== 'undefined' && this.meta.done) {
                this.state = 'killed';
            }
            this.meta.hBoosted = false;
            this.meta.hCurrent = 0;
            if(dismantler) {
                dismantler.suicide();
                //this.state = 'killed';
            }
            if(!this.meta.done && SpawnsHelper.spawnAvailable(room)) {
                SpawnsHelper.requestSpawn(this.ID, room, [
                    TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,MOVE,MOVE,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,MOVE,MOVE,MOVE,MOVE,MOVE
                ], {role: 'dismantleHealer'}, 'healer');
            }
        }
        else if(healer && !dismantler) {
            this.meta.dBoosted = false;
            this.meta.dCurrent = 0;
            if(!this.meta.done && SpawnsHelper.spawnAvailable(room)) {
                SpawnsHelper.requestSpawn(this.ID, room, [
                    TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,MOVE,MOVE,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,MOVE,MOVE,MOVE,MOVE,MOVE
                ],{role: 'boostedDismantler'}, 'dismantler');
            }
        }
        else {
            if(healer && !healer.spawning && !this.meta.hBoosted) {
                this.boost(healer, 'hBoosted');
            }
            if(dismantler && !dismantler.spawning && !this.meta.dBoosted) {
                this.boost(dismantler, 'dBoosted');
            }
            if(this.meta.hBoosted && this.meta.dBoosted) {
                if(Game.flags[this.ID]) {
                    // if(dismantler.pos.isNearTo(healer)) {
                    //     dismantler.moveTo(Game.flags[this.ID]);
                    //     healer.moveTo(dismantler);
                    // }
                    // else {
                    //     healer.moveTo(dismantler);
                    // }
                    if(dismantler.pos.isNearTo(healer) && dismantler.fatigue === 0 && healer.fatigue === 0) {
                        dismantler.moveTo(Game.flags[this.ID]);
                    }
                    else{
                        if(dismantler.pos.x === 0 || dismantler.pos.x === 49 || dismantler.pos.y === 0 || dismantler.pos.y === 49) {
                            dismantler.moveTo(Game.flags[this.ID]);
                        }
                    }
                    healer.moveTo(dismantler);
                    if(dismantler.hits < dismantler.hitsMax) {
                        healer.heal(dismantler);
                    }
                    else {
                        healer.heal(healer);
                    }
                }
                else {
                    this.handleCreeps(healer, dismantler);
                }
            }
        }
    }

    private boost(creep: Creep, mKey: string)
    {
        let partsToBoost: BodyPartConstant[] = [];
        let current;
        let mineral: ResourceConstant|undefined;
        let labs;

        if(mKey === 'hBoosted') {
            partsToBoost = [MOVE,TOUGH,HEAL];
            current = this.meta.hCurrent;
        }
        else if(mKey === 'dBoosted') {
            partsToBoost = [MOVE,WORK,TOUGH];
            current = this.meta.dCurrent;
        }

        if(typeof partsToBoost[current] === 'undefined') {
            this.meta[mKey] = true;
        }
        else {
            switch(partsToBoost[current]) {
                case MOVE:
                  mineral = RESOURCE_CATALYZED_ZYNTHIUM_ALKALIDE;
                  break;
                case TOUGH:
                  mineral = RESOURCE_CATALYZED_GHODIUM_ALKALIDE;
                  break;
                case HEAL:
                    mineral = RESOURCE_CATALYZED_LEMERGIUM_ALKALIDE;
                    break;
                case WORK:
                    mineral = RESOURCE_CATALYZED_ZYNTHIUM_ACID;
                    break;
            }
            if(mineral) {
                labs = creep.room.labs.filter((l: StructureLab) => l.mineralType === mineral && l.mineralAmount > 30);
                if(labs.length) {
                    if(!creep.pos.isNearTo(labs[0])) {
                        creep.moveTo(labs[0]);
                    }
                    else {
                        if(labs[0].boostCreep(creep) === OK) {
                            if(mKey === 'hBoosted') {
                                this.meta.hCurrent++;
                            }
                            else if(mKey === 'dBoosted') {
                                this.meta.dCurrent++;
                            }
                        }
                    }
                }
            }
        }
    }

    private handleCreeps(healer: Creep, dismantler: Creep)
    {
        // One creep is the leader, the other one follows
        // When they are in the target room, make sure the healers steps of the edge tiles
        if(dismantler.room.name !== this.meta.target) {
            if(dismantler.pos.isNearTo(healer) && dismantler.fatigue === 0 && healer.fatigue === 0) {
                dismantler.moveToRoom(this.meta.target);
            }
            else{
                if(dismantler.pos.x === 0 || dismantler.pos.x === 49 || dismantler.pos.y === 0 || dismantler.pos.y === 49) {
                    dismantler.moveToRoom(this.meta.target);
                }
            }
        }
        else {
            if(Game.time % 5 === 0) {
                dismantler.say('#overlords', true);
            }

            if(!this.meta.targetWall) {
                // Find a wall through code
            }
            if(this.meta.targetWall) {
                let wall: StructureWall|StructureRampart|null = Game.getObjectById(this.meta.targetWall);
                if(!wall) {
                    wall = Game.getObjectById('5b9be992c176a8157dd3421a');
                }
                if(wall) {
                    if(!dismantler.pos.isNearTo(wall)) {
                        if(dismantler.pos.x !== 0 && dismantler.pos.x !== 49 && dismantler.pos.y !== 0 && dismantler.pos.y !== 49) {
                            if(dismantler.pos.isNearTo(healer)) {
                                dismantler.moveTo(wall);
                            }
                        }
                        else {
                            dismantler.moveTo(wall);
                        }
                    }
                    else {
                        dismantler.dismantle(wall);
                    }
                }
                else {
                    let target;
                    // if(dismantler.room.spawns.length) {
                    //     target = dismantler.pos.findClosestByRange(dismantler.room.spawns);
                    // }
                    // if(dismantler.room.towers.length) {
                    //     target = dismantler.pos.findClosestByRange(dismantler.room.towers);
                    // }
                    // if(dismantler.room.storage) {
                    //     target = dismantler.room.storage;
                    // }
                    if(dismantler.room.spawns.length) {
                        target = dismantler.pos.findClosestByRange(dismantler.room.spawns);
                    }
                    else if(dismantler.room.extensions.length) {
                        target = dismantler.pos.findClosestByRange(dismantler.room.extensions);
                    }
                    else if(dismantler.room.terminal) {
                        target = dismantler.room.terminal;
                    }
                    else if(dismantler.room.towers.length) {
                        target = dismantler.pos.findClosestByRange(dismantler.room.towers);
                    }
                    else if(dismantler.room.spawns.length) {
                        target = dismantler.pos.findClosestByRange(dismantler.room.spawns);
                    }
                    else if(dismantler.room.extensions.length) {
                        target = dismantler.pos.findClosestByRange(dismantler.room.extensions);
                    }
                    // else if(dismantler.room.terminal) {
                    //     target = dismantler.room.terminal;
                    // }
                    // else if(dismantler.room.storage) {
                    //     target = dismantler.room.storage;
                    // }
                    else if(dismantler.room.labs.length) {
                        target = dismantler.pos.findClosestByRange(dismantler.room.labs);
                    }
                    else if(dismantler.room.containers.length) {
                        target = dismantler.pos.findClosestByRange(dismantler.room.containers);
                    }
                    else if(dismantler.room.links.length) {
                        target = dismantler.pos.findClosestByRange(dismantler.room.links);
                    }
                    if(target) {
                        if(dismantler.dismantle(target) === ERR_NOT_IN_RANGE) {
                            if(dismantler.pos.isNearTo(healer) && dismantler.fatigue === 0 && healer.fatigue === 0) {
                                dismantler.moveTo(target);
                            }
                            const structures = dismantler.pos.findInRange(dismantler.room.extensions, 1);
                            if(structures.length) {
                                dismantler.dismantle(structures[0]);
                            }
                        }
                    }
                    else {
                        this.meta.done = true;
                        const roads = dismantler.room.find(FIND_STRUCTURES, {
                            filter: (s: Structure) => s.structureType === STRUCTURE_ROAD
                        });
                        if(roads.length) {
                            target = dismantler.pos.findClosestByRange(roads);
                        }
                        if(target) {
                            if(dismantler.dismantle(target) === ERR_NOT_IN_RANGE) {
                                if(dismantler.pos.x === 0 || dismantler.pos.x === 49 || dismantler.pos.y === 0 || dismantler.pos.y === 49) {
                                    dismantler.moveTo(target);
                                }
                            }
                        }
                    }
                }
            }
        }
        // HEALER PART
        const dismantlerMissing = dismantler.hitsMax - dismantler.hits;
        const healerMissing = healer.hitsMax - healer.hits;
        const wall: StructureWall|null = Game.getObjectById(this.meta.targetWall);
        if(healer.room.name !== this.meta.target) {
            healer.moveTo(dismantler);
        }
        else {
            //const sayings: any = ['You','only','have','one','safemode','use','it','wise!','...','..'];
            // const sayings = ['Sie', 'haben', 'nur', 'ein', 'safemode', 'brauch', 'es', 'vernuuunftig','!!!!!'];
            // for(let i = 0; i < 9; i++) {
            //     if(Game.time % i === 0) {
            //         //const string = sayings[i] ? sayings[i] : '';
            //         healer.say(sayings[Game.time % sayings.length], true);
            //         break;
            //     }
            // }
            if(healer.pos.x === 0) {
                healer.moveTo(1, dismantler.pos.y + 1);
            }
            else if(healer.pos.x === 49) {
                healer.moveTo(48, dismantler.pos.y - 1);
            }
            else if(healer.pos.y === 0) {
                healer.moveTo(dismantler.pos.x + 1, 1);
            }
            else if(healer.pos.y === 49) {
                healer.moveTo(dismantler.pos.x, 48);
            }
            else {
                healer.moveTo(dismantler);
            }
        }
        if(dismantler.getActiveBodyparts(TOUGH) < 7 && healer.pos.inRangeTo(dismantler, 3)) {
            if(healer.pos.isNearTo(dismantler)) {
                healer.heal(dismantler);
            }
            else {
                if(healer.pos.inRangeTo(dismantler, 3)) {
                    healer.rangedHeal(dismantler);
                }
            }
        }
        else if(healer.getActiveBodyparts(TOUGH) < 7) {
            healer.heal(healer);
        }
        else {
            const hostiles = healer.pos.findInRange(healer.room.hostiles, 3);
            let hasAttacked = false;
            if(hostiles.length) {
                healer.rangedAttack(hostiles[0]);
                hasAttacked = true;
            }
            else {
                const ramparts = healer.pos.findInRange(FIND_STRUCTURES, 3 ,{
                    filter: (s: Structure) => s.structureType === STRUCTURE_RAMPART && s.hits < 5000
                });
                if(ramparts.length) {
                    const target: Structure|null = healer.pos.findClosestByRange(ramparts);
                    if(target) {
                        healer.rangedAttack(target);
                    }
                }
                else {
                    if(wall && healer.pos.inRangeTo(wall,3)) {
                        healer.rangedAttack(wall);
                    }
                }
            }
            if(dismantler.hits < dismantler.hitsMax) {
                if(healer.pos.isNearTo(dismantler)) {
                    healer.heal(dismantler);
                }
                else {
                    if(healer.pos.inRangeTo(dismantler, 3)) {
                        healer.rangedHeal(dismantler);
                    }
                }
            }
            else {
                if(healer.hits < healer.hitsMax) {
                    healer.heal(healer);
                }
                else {
                    const allies = healer.pos.findInRange(healer.room.allies, 3).filter((c: Creep) => c.hits < c.hitsMax);
                    if(allies.length) {
                        const target = healer.pos.findClosestByRange(allies);
                        if(target && healer.pos.isNearTo(target)) {
                            healer.heal(target);
                        }
                        else if(target) {
                            healer.rangedHeal(target);
                        }
                    }
                    else {
                        healer.heal(healer);
                    }
                }
            }
        }
    }
}

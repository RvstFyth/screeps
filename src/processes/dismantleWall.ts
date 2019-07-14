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
        //this.state = 'killed';
        //this.meta.healer = '486_11251055';

          if(this.ID == 3836) {
             //this.meta.target = 'W53S26';
             this.meta.target = 'W52S26';
         }


        const requiredBoosts = [RESOURCE_CATALYZED_ZYNTHIUM_ALKALIDE,RESOURCE_CATALYZED_GHODIUM_ALKALIDE,RESOURCE_CATALYZED_LEMERGIUM_ALKALIDE,RESOURCE_CATALYZED_ZYNTHIUM_ACID];
        // const healerBody = [
        //     TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,
        //     MOVE,MOVE,
        //     RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,
        //     HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,
        //     MOVE,MOVE,MOVE,MOVE,MOVE
        // ];
        const healerBody = [
            TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,
            MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,
            RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,HEAL,HEAL,HEAL,HEAL,
            HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,MOVE,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,MOVE,HEAL
        ];
        //this.meta.hBoosted = false;
        //this.meta.dBoosted = false;
        const dismantlerBody = [
            TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,
            MOVE,MOVE,
            WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,
            MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE
        ];

        const boostsAmounts = {
            RESOURCE_CATALYZED_ZYNTHIUM_ALKALIDE: 600, // MOVE
            RESOURCE_CATALYZED_GHODIUM_ALKALIDE: 600, // TOUGH
            RESOURCE_CATALYZED_LEMERGIUM_ALKALIDE: 420, //HEAL
            RESOURCE_CATALYZED_ZYNTHIUM_ACID: 900 // WORK / DISMANTLE
        }

        const room = Game.rooms[this.meta.room];
        const healer = Game.creeps[this.meta.healer];
        const dismantler = Game.creeps[this.meta.dismantler];
        if(!healer && !dismantler && this.ID === 3377) {
            this.state = 'killed';
            return;
        }
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
            if(typeof this.meta.needBoosts !== 'undefined' && this.meta.needBoosts === false) {
                this.meta.hBoosted = true;
            }
            else {
                this.meta.hBoosted = false;
            }
            this.meta.hCurrent = 0;
            if(dismantler) {
                dismantler.suicide();
                //this.state = 'killed';
            }
            if(!this.meta.done && SpawnsHelper.spawnAvailable(room)) {
                SpawnsHelper.requestSpawn(this.ID, room, healerBody, {role: 'dismantleHealer'}, 'healer');
            }
        }
        else if(healer && !dismantler) {
            if(typeof this.meta.needBoosts !== 'undefined' && this.meta.needBoosts === false) {
                this.meta.dBoosted = true;
            }
            else {
                this.meta.dBoosted = false;
            }
            this.meta.dCurrent = 0;
            if(!this.meta.done && SpawnsHelper.spawnAvailable(room)) {
                // SpawnsHelper.requestSpawn(this.ID, room, [
                //     TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,
                //     MOVE,MOVE,
                //     WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,
                //     MOVE,MOVE,MOVE,MOVE,MOVE
                // ],{role: 'boostedDismantler'}, 'dismantler');
                SpawnsHelper.requestSpawn(this.ID, room, dismantlerBody,{role: 'boostedDismantler'}, 'dismantler');
            }
        }
        else {
            if(healer && !healer.spawning && !this.meta.hBoosted) {
                if(typeof this.meta.needBoosts !== 'undefined' && this.meta.needBoosts === false) {
                    this.meta.hBoosted = true;
                }
                else {
                    this.boost(healer, 'hBoosted');
                }
            }
            if(dismantler && !dismantler.spawning && !this.meta.dBoosted) {
                if(typeof this.meta.needBoosts !== 'undefined' && this.meta.needBoosts === false) {
                    this.meta.hBoosted = true;
                }
                else {
                    this.boost(dismantler, 'dBoosted');
                }
            }
            if(this.meta.hBoosted && this.meta.dBoosted) {
                if(Game.flags[this.ID + '_p']) {
                    if(healer && (!dismantler || !this.meta.dBoosted)) {
                        healer.moveTo(Game.flags[this.ID+'_p']);
                    }
                    if(dismantler && (!healer || !this.meta.hBoosted)) {
                        dismantler.moveTo(Game.flags[this.ID+'_p']);
                    }
                }
                if(Game.flags[this.ID]) {
                    if(dismantler.pos.isNearTo(healer) && dismantler.fatigue === 0 && healer.fatigue === 0) {
                        dismantler.moveTo(Game.flags[this.ID]);
                    }
                    else{
                        if(dismantler.pos.x === 0 || dismantler.pos.x === 49 || dismantler.pos.y === 0 || dismantler.pos.y === 49) {
                            dismantler.moveTo(Game.flags[this.ID]);
                        }
                    }
                    healer.moveTo(dismantler);
                    if(dismantler.getActiveBodyparts(TOUGH) < 7) {
                        healer.heal(dismantler);
                    }
                    else {
                        healer.heal(healer);
                    }
                    const hostiles = healer.pos.findInRange(healer.room.hostiles, 3);
                    if(hostiles.length) {
                        healer.rangedAttack(hostiles[0]);
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
            partsToBoost = [MOVE,TOUGH,HEAL,RANGED_ATTACK];
            current = this.meta.hCurrent;
        }
        else if(mKey === 'dBoosted') {
            partsToBoost = [MOVE,WORK,TOUGH];
            current = this.meta.dCurrent;
        }

        if(typeof partsToBoost[current] === 'undefined') {
            this.meta[mKey] = true;
        }
        else { // catalyzed keanium alka
            switch(partsToBoost[current]) {
                case RANGED_ATTACK:
                    mineral = RESOURCE_CATALYZED_KEANIUM_ALKALIDE;
                    break;
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
                //dismantler.say('#overlords', true);
            }

            if(!this.meta.targetWall) {
                // Find a wall through code
            }
            if(this.meta.targetWall) {
                let wall: StructureWall|StructureRampart|null = Game.getObjectById(this.meta.targetWall);
                if(!wall) {
                    if(!wall) {
                        wall = Game.getObjectById('5c6fd58f9276b32612cff2ba');
                    }
                    if(!wall) {
                        if(typeof this.meta.needBoosts === 'undefined' && !dismantler.room.towers) {
                            this.meta.needBoosts = false;
                        }
                        wall = Game.getObjectById('5c70a009c43260426cf4101a');
                    }
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
                    try {
                        const structures = dismantler.room.find(FIND_STRUCTURES, {
                            filter: (s: Structure) => s.structureType === STRUCTURE_SPAWN || s.structureType === STRUCTURE_TOWER || s.structureType === STRUCTURE_EXTENSION ||
                                s.structureType === STRUCTURE_LAB || s.structureType === STRUCTURE_OBSERVER || s.structureType === STRUCTURE_POWER_SPAWN
                        });
                        const withoutRamparts = structures.filter((s: Structure) => !s.pos.lookFor(LOOK_STRUCTURES).filter((s:Structure) => s.structureType === STRUCTURE_RAMPART).length);

                        if(withoutRamparts.length) {
                            const towers = withoutRamparts.filter((s:Structure) => s.structureType === STRUCTURE_TOWER);
                            if(towers.length) target = dismantler.pos.findClosestByRange(towers);
                            else {
                                const spawns = withoutRamparts.filter((s:Structure) => s.structureType === STRUCTURE_SPAWN);
                                if(spawns.length) target = dismantler.pos.findClosestByRange(spawns);
                                else target = dismantler.pos.findClosestByRange(withoutRamparts);
                            }
                        }
                    }
                    catch(e) {
                        console.log(`Error in defining target for dismantler`);
                    }

                    if(!target) {
                        healer.suicide();
                        dismantler.suicide();
                        this.state = 'killed';
                        if(dismantler.room.spawns.length) {
                            target = dismantler.pos.findClosestByRange(dismantler.room.spawns);
                        }
                        else if(dismantler.room.towers.length) {
                            target = dismantler.pos.findClosestByRange(dismantler.room.towers);
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
                    }
                    if(target) {
                        if(dismantler.dismantle(target) === ERR_NOT_IN_RANGE) {
                            if(dismantler.pos.isNearTo(healer) && dismantler.fatigue === 0 && healer.fatigue === 0) {
                                dismantler.moveTo(target, {maxRooms: 1});
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
            if(healer.pos.x === 0) {
                const pos = new RoomPosition(1, dismantler.pos.y + 1, healer.room.name);
                if(pos.isWalkable(false)) healer.moveTo(pos);
                else {
                    const pos = new RoomPosition(1, dismantler.pos.y - 1, healer.room.name);
                    if(pos.isWalkable(false)) healer.moveTo(pos);
                    else {
                        // TODO
                    }
                }
            }
            else if(healer.pos.x === 49) {
                const pos = new RoomPosition(48, dismantler.pos.y - 1, healer.room.name);
                if(pos.isWalkable(false)) healer.moveTo(pos);
                else {
                    const pos = new RoomPosition(48, dismantler.pos.y + 1, healer.room.name);
                    if(pos.isWalkable(false)) healer.moveTo(pos);
                    else {

                    }
                }
            }
            else if(healer.pos.y === 0) {
                const pos = new RoomPosition(dismantler.pos.x + 1, 1, healer.room.name);
                if(pos.isWalkable(false)) healer.moveTo(pos);
                else {
                    const pos = new RoomPosition(dismantler.pos.x - 1, 1, healer.room.name);
                    if(pos.isWalkable(false)) healer.moveTo(pos);
                    else {

                    }
                }
            }
            else if(healer.pos.y === 49) {
                const pos = new RoomPosition(dismantler.pos.x + 1, 48, healer.room.name);
                if(pos.isWalkable(false)) healer.moveTo(pos);
                else {
                    const pos = new RoomPosition(dismantler.pos.x - 1, 48, healer.room.name);
                    if(pos.isWalkable(false)) healer.moveTo(pos);
                    else {

                    }
                }
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
        else if(healer.getActiveBodyparts(TOUGH) < 8) {
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

    defineDismantleTarget(room: Room)
    {

    }
}

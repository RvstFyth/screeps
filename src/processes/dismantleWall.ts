import {Process} from '../ROS/process'
import {SpawnsHelper} from '../helpers/spawns'

// META: room, target, targetWall
// OS.kernel.addProcess('dismantleWall', {room: 'W59S21', target: 'W59S14', targetWall: '5b68b001025e8513fe02c1f5'}, 0);
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
        const room = Game.rooms[this.meta.room];
        const healer = Game.creeps[this.meta.healer];
        const dismantler = Game.creeps[this.meta.dismantler];

        if(typeof this.meta.initialized === 'undefined') {
            this.init();
        }
        if(!healer) {
            this.meta.hBoosted = false;
            this.meta.hCurrent = 0;
            if(dismantler) {
                dismantler.suicide();
                //this.state = 'killed';
            }
            if(SpawnsHelper.spawnAvailable(room)) {
                SpawnsHelper.requestSpawn(this.ID, room, [
                    TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,MOVE,MOVE,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,MOVE,MOVE,MOVE,MOVE,MOVE
                ], {role: 'dismantleHealer'}, 'healer');
            }
        }
        else if(healer && !dismantler) {
            this.meta.dBoosted = false;
            this.meta.dCurrent = 0;
            if(SpawnsHelper.spawnAvailable(room)) {
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
                    healer.moveTo(Game.flags[this.ID]);
                    dismantler.moveTo(Game.flags[this.ID]);
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
            if(!this.meta.targetWall) {
                // Find a wall through code
            }
            if(this.meta.targetWall) {
                const wall: StructureWall|null = Game.getObjectById(this.meta.targetWall);
                if(wall) {
                    if(!dismantler.pos.isNearTo(wall)) {
                        dismantler.moveTo(wall);
                    }
                    else {
                        dismantler.dismantle(wall);
                        if(Game.time % 5 === 0) {
                            dismantler.say('#overlords', true);
                        }
                    }
                }
                else {
                    let target;
                    if(dismantler.room.towers.length) {
                        target = dismantler.pos.findClosestByRange(dismantler.room.towers);
                    }
                    else if(dismantler.room.spawns.length) {
                        target = dismantler.pos.findClosestByRange(dismantler.room.spawns);
                    }
                    else if(dismantler.room.extensions.length) {
                        target = dismantler.pos.findClosestByRange(dismantler.room.extensions);
                    }
                    else if(dismantler.room.terminal) {
                        target = dismantler.room.terminal;
                    }
                    else if(dismantler.room.storage) {
                        target = dismantler.room.storage;
                    }
                    else if(dismantler.room.labs.length) {
                        target = dismantler.pos.findClosestByRange(dismantler.room.labs);
                    }
                    else if(dismantler.room.containers.length) {
                        target = dismantler.pos.findClosestByRange(dismantler.room.containers);
                    }
                    if(target) {
                        if(dismantler.dismantle(target) === ERR_NOT_IN_RANGE) {
                            if(dismantler.pos.isNearTo(healer) && dismantler.fatigue === 0 && healer.fatigue === 0) {
                                dismantler.moveTo(target);
                            }
                        }
                    }
                    else {
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
                healer.moveTo(1, dismantler.pos.y + 1);
            }
            else if(healer.pos.x === 49) {
                healer.moveTo(48, dismantler.pos.y + 1);
            }
            else if(healer.pos.y === 0) {
                healer.moveTo(dismantler.pos.x + 1, 1);
            }
            else if(healer.pos.y === 49) {
                healer.moveTo(dismantler.pos.x + 1, 48);
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
            if(hostiles.length) {
                healer.rangedAttack(hostiles[0]);
            }
            else {
                if(wall && healer.pos.inRangeTo(wall,3)) {
                    healer.rangedAttack(wall);
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
                healer.heal(healer);
            }
        }
    }
}

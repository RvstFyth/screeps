import { PowerCreeps } from "processes/powerCreeps";

export class N3RD
{

    static run(powerCreep: PowerCreep)
    {
        try {
            this.run2(powerCreep);
        }
        catch(e) {

        }
    }

    static run2(powerCreep: PowerCreep)
    {
        if(!powerCreep.memory.spawnID && powerCreep.room) {
            const powerSpawns = powerCreep.room.find(FIND_STRUCTURES, {filter: (s:Structure) => s.structureType === STRUCTURE_POWER_SPAWN});
            if(powerSpawns.length) {
                powerCreep.memory.spawnID = powerSpawns[0].id;
            }
        }
        let triggered = false;
        const powerSpawn: StructurePowerSpawn|null = Game.getObjectById(powerCreep.memory.spawnID);
        if(powerSpawn && powerCreep.room) {
            if(powerCreep.ticksToLive && powerCreep.ticksToLive < 4000) {
                if(!powerCreep.pos.isNearTo(powerSpawn)) {
                    powerCreep.moveTo(powerSpawn);
                }
                else {
                    powerCreep.renew(powerSpawn);
                }
            }
            else {
                // Enable power if not active!
                if(powerCreep.room.controller && !powerCreep.room.controller.isPowerEnabled) {
                    if(!powerCreep.pos.isNearTo(powerCreep.room.controller)) {
                        powerCreep.moveTo(powerCreep.room.controller, {ignoreCreeps: true});
                    }
                    else {
                        powerCreep.enableRoom(powerCreep.room.controller);
                    }
                    triggered = true;
                }
                else {
                    if(_.sum(powerCreep.carry) === powerCreep.carryCapacity && powerCreep.carry['ops']) {
                        if(powerCreep.room.storage) {
                            if(!powerCreep.pos.isNearTo(powerCreep.room.storage)) {
                                powerCreep.moveTo(powerCreep.room.storage);
                            }
                            else {
                                powerCreep.transfer(powerCreep.room.storage, 'ops');
                            }
                        }
                    }
                    else {
                        if(powerCreep.room.memory.centerX && powerCreep.room.memory.centerY) {
                            if(powerCreep.pos.x !== powerCreep.room.memory.centerX || powerCreep.pos.y  !== powerCreep.room.memory.centerY) {
                                powerCreep.moveTo(powerCreep.room.memory.centerX, powerCreep.room.memory.centerY);
                            }
                        }
                        else {
                            // Move to power spawn
                            if(!powerCreep.pos.isNearTo(powerSpawn)) {
                                powerCreep.moveTo(powerSpawn);
                            }
                        }
                    }
                }
            }
        }

        const ops = powerCreep.carry['ops'];
        if(powerCreep.room) {
            // Regen source
            if(!triggered && powerCreep.powers[PWR_REGEN_SOURCE]) {
                const cd: number|undefined = powerCreep.powers[PWR_REGEN_SOURCE].cooldown;
                if(cd !== undefined && cd <= 0) {
                    const sources: Source[] = powerCreep.room.sources.filter((s: Source) => (!s.memory.boostedTS || s.memory.boostedTS + 270 < Game.time));
                    if(sources.length) {
                        triggered = true;
                        if(powerCreep.pos.inRangeTo(sources[0],3)) {
                            if(powerCreep.usePower(PWR_REGEN_SOURCE, sources[0]) === OK) {
                                sources[0].memory.boostedTS = Game.time;
                            }
                        }
                        else {
                            powerCreep.moveTo(sources[0].pos);
                        }
                    }
                }
            }

            if(!triggered && powerCreep.powers[PWR_OPERATE_LAB] && global.OS.kernel.hasProcessForNameAndMetaKeyValue('makeBoosts', 'room', powerCreep.room.name)) {
                const cd: number|undefined = powerCreep.powers[PWR_OPERATE_LAB].cooldown;
                if(ops && cd !== undefined && cd <= 0 && ops  > 10) {
                    if(powerCreep.room.labs.length) {
                        const filtered = powerCreep.room.labs.filter(l => (!l.memory.boostedTS || l.memory.boostedTS + 1000 < Game.time) && l.memory.state !== global.LAB_STATE.SUPPLY && l.memory.state !== global.LAB_STATE.BOOSTING);
                        if(filtered.length) {
                            triggered = true;
                            if(powerCreep.pos.inRangeTo(filtered[0], 3)) {
                                if(powerCreep.usePower(PWR_OPERATE_LAB, filtered[0]) === OK) {
                                    filtered[0].memory.boostedTS = Game.time;
                                }
                            }
                            else {
                                powerCreep.moveTo(filtered[0]);
                            }
                        }
                    }
                }
            }

            if(!triggered && powerCreep.powers[PWR_OPERATE_EXTENSION]) {
                const extensions = powerCreep.room.extensions.filter((e: StructureExtension) => e.energy < e.energyCapacity);
                const cd: number|undefined = powerCreep.powers[PWR_OPERATE_EXTENSION].cooldown;
                if(cd !== undefined && cd <= 0 && extensions.length > 5 && powerCreep.room.storage) {
                    triggered = true;
                    if(powerCreep.pos.inRangeTo(powerCreep.room.storage, 2)) {
                        powerCreep.usePower(PWR_OPERATE_EXTENSION, powerCreep.room.storage);
                    }
                    else {
                        powerCreep.moveTo(powerCreep.room.storage);
                    }
                }
            }

            if(powerCreep.powers[PWR_GENERATE_OPS] && powerCreep.room.storage) {
                const opsInStorage = powerCreep.room.storage.store[RESOURCE_OPS] || 0;
                const freeSpaceInStorage = powerCreep.room.storage.storeCapacity - _.sum(powerCreep.room.storage.store);
                const genOpsCD: number|undefined = powerCreep.powers[PWR_GENERATE_OPS].cooldown;
                const opsInCarry = powerCreep.carry[RESOURCE_OPS] || 0;
                if(genOpsCD !== undefined && genOpsCD <= 0 && (opsInCarry < powerCreep.carryCapacity / 2 || freeSpaceInStorage > 100000 && opsInStorage < 150000)) {
                    powerCreep.usePower(PWR_GENERATE_OPS);
                }
            }
        }
    }
}

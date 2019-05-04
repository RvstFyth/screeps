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
        if(!powerCreep.memory.spawnID) {
            const powerSpawns = powerCreep.room.find(FIND_STRUCTURES, {filter: (s:Structure) => s.structureType === STRUCTURE_POWER_SPAWN});
            if(powerSpawns.length) {
                powerCreep.memory.spawnID = powerSpawns[0].id;
            }
        }

        const powerSpawn: StructurePowerSpawn|null = Game.getObjectById(powerCreep.memory.spawnID);
        if(powerSpawn) {
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
                        powerCreep.moveTo(powerCreep.room.controller);
                    }
                    else {
                        powerCreep.enableRoom(powerCreep.room.controller);
                    }
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
                        // Move to power spawn
                        if(!powerCreep.pos.isNearTo(powerSpawn)) {
                            powerCreep.moveTo(powerSpawn);
                        }
                    }
                }
            }
        }

        // OPERATE_EXTENSIONS costs 2 OPS and ha sa 50t cooldown
        // const ext = powerCreep.room.extensions.filter((e: StructureExtension) => e.energy < e.energyCapacity);
        // if(powerCreep.powers[PWR_OPERATE_EXTENSION]) {
        //     if(ext.length > 10) {
        //         if(powerCreep.room.storage) {
        //             if(!powerCreep.pos.inRangeTo(powerCreep.room.storage, 3)) {
        //                 powerCreep.moveTo(powerCreep.room.storage);
        //             }
        //             else {
        //                 const opExtCD: number|undefined = powerCreep.powers[PWR_OPERATE_EXTENSION].cooldown;
        //                 if(opExtCD !== undefined && opExtCD <= 0) {

        //                 }
        //             }
        //         }
        //     }
        // }

        const ops = powerCreep.carry['ops'];
        let triggered = false;

        // Regen source
        if(powerCreep.powers[PWR_REGEN_SOURCE]) {
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
            if(cd !== undefined && cd <= 0 && ops  > 10) {
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

        if(powerCreep.powers[PWR_GENERATE_OPS]) {
            const genOpsCD: number|undefined = powerCreep.powers[PWR_GENERATE_OPS].cooldown;
            if(genOpsCD !== undefined && genOpsCD <= 0) {
                powerCreep.usePower(PWR_GENERATE_OPS);
            }
        }
    }
}

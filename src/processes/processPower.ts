import {Process} from '../ROS/process'
import {SpawnsHelper} from '../helpers/spawns'

// META
// room
// OS.kernel.addProcess('processPower', {room: 'W56S33'}, 0);
export class ProcessPower extends Process
{

    init(room: Room)
    {
        this.meta.shouldKill = false;
        const powerSpawns = room.find(FIND_STRUCTURES, {filter: (s:Structure) => s.structureType === STRUCTURE_POWER_SPAWN});
        if(powerSpawns.length) {
            this.meta.powerSpawn = powerSpawns[0].id;
        }

        this.meta.initialized = true;
    }

    run()
    {
        const room = Game.rooms[this.meta.room];
        const creep = Game.creeps[this.meta.transporter];

        if(!this.meta.initialized) {
            this.init(room);
        }

        const spawn: StructurePowerSpawn|null = Game.getObjectById(this.meta.powerSpawn);

        if(room && spawn) {
            if(spawn.energy === spawn.energyCapacity && spawn.power === spawn.powerCapacity) {
                this.meta.shouldProcess = true;
            }
            else if(spawn.energy < 50 || spawn.power === 0) {
                this.meta.shouldProcess = false;
            }
            if(this.meta.shouldProcess) {
                this.processPower(spawn);
            }

            if(this.meta.shouldKill) {
                if(!Game.creeps[this.meta.transporter]) {
                    this.state = 'killed';
                }
            }
            else if((!this.meta.transporter || !creep) && !this.meta.shouldProcess) {
                if(room.storage) {
                    const sAmount = room.storage.store[RESOURCE_POWER] || 0;
                    const energy = room.storage.store[RESOURCE_ENERGY];
                    const terminalAmount = room.terminal && room.terminal.store[RESOURCE_POWER] ? room.terminal.store[RESOURCE_POWER] : 0;
                    if(sAmount && sAmount > 100 && energy && energy > 200000) {
                        if(SpawnsHelper.spawnAvailable(room)) {
                            SpawnsHelper.requestSpawn(this.ID, Game.rooms[this.meta.room], [CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE], {role: 'processPowerHauler'}, 'transporter');
                        }
                    }
                    else if((!sAmount || sAmount < 100) && (!terminalAmount || terminalAmount < 200) && energy && energy > 200000) {
                        // Check if we can request power from other rooms!
                        this.requestPower(room);
                    }
                }
            }
            else if(creep && creep.spawning) {

            }
            else if(creep) {
                try {
                    this.handleTransporter(creep, spawn);
                }
                catch(e) {
                    console.log(`processPower failed: ${e.message}`);
                }
            }
        }
        else {
            this.state = 'killed';
        }
    }

    requestPower(room: Room)
    {
        if(!global.OS.kernel.hasProcessForNameAndMetaKeyValue('sendResources', 'target', room.name) && !global.OS.kernel.hasProcessForNameAndMetaKeyValue('haulResources', 'room', room.name)) {
            for(let n in Game.rooms) {
                if(n === this.meta.room) {
                    continue;
                }
                const tr: Room = Game.rooms[n];
                if(tr.controller && tr.controller.my && tr.storage && tr.terminal && tr.terminal.my && !global.OS.kernel.hasProcessForNameAndMetaKeyValue('sendResources', 'room', tr.name)) {
                    const totalPower = (tr.terminal.store[RESOURCE_POWER] || 0) + (tr.storage.store[RESOURCE_POWER] || 0);
                    if(totalPower > 3000) {
                        global.OS.kernel.addProcess('sendResources', {room: tr.name, target: room.name, resource: RESOURCE_POWER, amount: 1000}, 0);
                        break;
                    }
                }
            }
        }
    }

    processPower(spawn: StructurePowerSpawn)
    {
        if(spawn) {
            if(spawn.energy >= 50 && spawn.power > 0) {
                spawn.processPower();
            }
        }
        else {
            this.meta.shouldKill = true;
        }
    }

    handleTransporter(creep: Creep, spawn: StructurePowerSpawn)
    {
        if(this.meta.shouldKill) {
            creep.suicide();
        }
        else {
            if(_.sum(creep.carry) === 0) {
                creep.memory.harvesting = true;
            }
            else if(_.sum(creep.carry) === creep.carryCapacity) {
                creep.memory.harvesting = false;
            }
            if(creep.memory.harvesting) {
                if(spawn.power === 0 && !creep.carry[RESOURCE_POWER]) {
                    if(creep.room.storage && creep.room.storage.store[RESOURCE_POWER]) {
                        const sAmount = creep.room.storage.store[RESOURCE_POWER];
                        if(sAmount && sAmount > 100) {
                            if(creep.withdraw(creep.room.storage, RESOURCE_POWER, 100) === ERR_NOT_IN_RANGE) {
                                creep.moveTo(creep.room.storage);
                            }
                        }
                    }
                    else {
                        this.meta.shouldKill = true;
                    }
                }
                else {
                    if(creep.room.storage) {
                        // Fetch energy from storage
                        if(creep.pos.isNearTo(creep.room.storage)) {
                            const cCarryLeft = creep.carryCapacity - _.sum(creep.carry);
                            const eNeeded = spawn.energyCapacity - spawn.energy;
                            const amount = eNeeded >= cCarryLeft ? cCarryLeft : eNeeded;
                            creep.withdraw(creep.room.storage, RESOURCE_ENERGY, amount);
                        }
                        else {
                            creep.moveTo(creep.room.storage);
                        }
                    }
                }
            }
            else {
                // deliver
                if(creep.pos.isNearTo(spawn) && !this.meta.shouldProcess) {
                    if(creep.carry[RESOURCE_POWER]) {
                        creep.transfer(spawn, RESOURCE_POWER);
                    }
                    else if(creep.carry[RESOURCE_ENERGY]) {
                        creep.transfer(spawn, RESOURCE_ENERGY);
                    }
                }
                else {
                    creep.moveTo(spawn);
                }
            }
        }
    }
}

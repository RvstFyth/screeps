import {Process} from '../ROS/process'
import {SpawnsHelper} from '../helpers/spawns'

// META
// room
export class EmptyTerminal extends Process
{

    run()
    {
        const room = Game.rooms[this.meta.room];

        if(room && room.terminal && room.storage) {
            if(this.meta.shouldKill) {
                this.killProcess();
            }
            if(!this.meta.creep || !Game.creeps[this.meta.creep]) {
                if(SpawnsHelper.spawnAvailable(room)) {
                    SpawnsHelper.requestSpawn(this.ID, room,
                        [CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE]
                        , {role: 'terminalTransporter'}, 'creep'
                    );
                }
            }
            else if(Game.creeps[this.meta.creep] && Game.creeps[this.meta.creep].spawning) {

            }
            else if(Game.creeps[this.meta.creep]) {
                this.handleTransporter(Game.creeps[this.meta.creep]);
            }
        }
        else {
            this.state = 'killed';
        }
    }

    killProcess()
    {
        if(Game.creeps[this.meta.creep]) {
            Game.creeps[this.meta.creep].suicide();
        }

        this.state = 'killed';
    }

    handleTransporter(creep: Creep)
    {
        if(creep.room.storage && creep.room.terminal){
            if(!creep.memory.harvesting &&  _.sum(creep.carry) === 0) {
                creep.memory.harvesting = true;
            }
            else if(creep.memory.harvesting && _.sum(creep.carry) === creep.carryCapacity) {
                creep.memory.harvesting = false;
            }
            if(!creep.memory.harvesting) {
                if(!creep.pos.isNearTo(creep.room.storage)) {
                    creep.moveTo(creep.room.storage);
                }
                else {
                    creep.transfer(creep.room.storage, _.findKey(creep.carry) as ResourceConstant);
                }
            }
            else {
                const resources = Object.keys(creep.room.terminal.store).filter(r => r !== 'energy' && r !== RESOURCE_POWER);
                if(!resources.length) {
                    this.meta.shouldKill = true;
                }
                if(!creep.pos.isNearTo(creep.room.terminal)) {
                    creep.moveTo(creep.room.terminal);
                }
                else {
                    if(resources.length) {
                        creep.withdraw(creep.room.terminal, (resources[0] as ResourceConstant));
                    }
                    else {
                        creep.memory.harvesting = false;
                        this.meta.shouldKill = true;
                    }
                }
            }
        }
    }
}

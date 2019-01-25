import {Process} from 'ROS/process'
import {SpawnsHelper} from 'helpers/spawns'

// META
// room
// boosts
export class StockBoostsLab extends Process
{

    private init(room: Room)
    {
        this.meta.labsToIgnore = this.defineLabsToIgnore(room);
        this.meta.done = false;
        this.meta.initialized = true;
        this.meta.lab = '';
        this.meta.current = '';
    }

    public run()
    {
        // this.state = 'killed';
        try {
            this.run2();
        }
        catch(e)  {
            console.log("stockBoostsLab error: "+e.message);
        }
    }

    public run2()
    {
        const room = Game.rooms[this.meta.room];

        if(typeof this.meta.initialized === 'undefined') {
            this.init(room);
        }

        if(room) {
            this.handleTransporter(room);
        }
        else {
            this.state = 'killed';
        }
    }

    private handleTransporter(room: Room)
    {
        const creep = Game.creeps[this.meta.transporter];

        if(!this.meta.transporter || !creep) {
            if(!this.meta.done && SpawnsHelper.spawnAvailable(room)) {
                const bodyParts = [CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE]
                SpawnsHelper.requestSpawn(this.ID, room, bodyParts, {role: 'labTransporter'}, 'transporter');
            }
            else if(this.meta.done) {
                this.state = 'killed';
            }
        }
        else if(creep && creep.spawning) {

        }
        else if(creep) {
            if(!this.meta.done) {
                this.transport(creep);
            }
            else {
                creep.suicide();
            }
        }
    }

    private defineLabsToIgnore(room: Room) : string[]
    {
        this.meta.labs = [];
        const labRanges = [];
        for (const labTarget of room.labs) {
            const labTargetsInRange = labTarget.pos.findInRange(room.labs, 2);

            const labRange: any = {
                lab: labTarget,
                labsInRange: labTargetsInRange.length
            };

            labRanges.push(labRange);
        }

        labRanges.sort((a, b) =>
            b.labsInRange
            -
            a.labsInRange
        );

        return [labRanges[0].lab.id, labRanges[1].lab.id];
    }

    private defineTargetLab(room: Room)
    {
        const lab = room.labs.filter((l: StructureLab) => l.mineralType === this.meta.current);
        if(lab && lab.length) {
            this.meta.lab = lab[0];
        }
        else {
            const availableLabs = room.labs.filter((l: StructureLab) => l.mineralAmount === 0 && this.meta.labsToIgnore.indexOf(l.id) < 0);
            if(availableLabs.length) {
                this.meta.lab = availableLabs[0].id;
            }
        }
    }

    private defineResource(room: Room)
    {
        let result;
        for(let i in this.meta.boosts) {
            console.log(this.meta.boosts[i]);
            const labs = room.labs.filter((l:StructureLab) => this.meta.labsToIgnore.indexOf(l.id) < 0 && l.mineralType == this.meta.boosts[i]);
            if(!labs.length) {
                result = this.meta.boosts[i];
                break;
            }
        }
        if(result) {
            this.meta.current = result;
        }
    }

    private transport(creep: Creep)
    {
        if(this.meta.boosts.length === 1) {
            this.meta.current = this.meta.boosts[0];
        }
        else if(!this.meta.current || this.meta.current == '0') {
            this.defineResource(creep.room);
        }
        if(!this.meta.lab) {
            this.defineTargetLab(creep.room);
        }

        if(this.meta.current && this.meta.lab) {
            const lab: StructureLab|null = Game.getObjectById(this.meta.lab);
            if(lab) {
                if(lab.mineralAmount === lab.mineralCapacity) {
                    this.meta.lab = '';
                    this.meta.current = '';
                }
                if(_.sum(creep.carry) === 0) {
                    const amountNeeded = 3000 - lab.mineralAmount >= creep.carryCapacity ? creep.carryCapacity : 3000 - lab.mineralAmount;
                    let amountStored: number|undefined = 0;
                    let target: StructureStorage|StructureTerminal|null = null;
                    if(creep.room.storage && creep.room.storage.store[this.meta.current as ResourceConstant]) {
                        target = creep.room.storage;
                        amountStored = creep.room.storage.store[this.meta.current as ResourceConstant];
                    }
                    else if(creep.room.terminal && creep.room.terminal.store[this.meta.current as ResourceConstant]) {
                        target = creep.room.terminal;
                        amountStored = creep.room.terminal.store[this.meta.current as ResourceConstant]
                    }

                    if(target && amountStored) {
                        const amount = amountStored >= amountNeeded ? amountNeeded : amountStored;
                        if(creep.withdraw(target, this.meta.current, amount) === ERR_NOT_IN_RANGE) {
                            creep.moveTo(target);
                        }
                    }
                }
                else {
                    if(creep.transfer(lab, this.meta.current) === ERR_NOT_IN_RANGE) {
                        creep.moveTo(lab);
                    }
                }
            }
        }
        else {
            this.meta.done = true;
        }
    }
}

import {Process} from '../ROS/process';
import {SpawnsHelper} from '../helpers/spawns';
import { BoostsHelper } from 'helpers/boosts';
import { BlueprintsHelper } from 'helpers/blueprint';

export class HandleLabs extends Process
{
    public run()
    {
        //this.state = 'killed';
        const room = Game.rooms[this.meta.room];
        if(room && room.controller && room.controller.my) {
            if(room.labs.length) {
                // this.meta.state = 'filling';
                if(!this.meta.boostToProduce) {
                    this.decideBoostToProduce(room);
                    this.meta.inputLabs = this.defineInputLabs(room);
                }
                this.handleCreep(room);
            } else {
                // TODO: suicide creep and remove memory entries
                const creep = Game.creeps[this.meta.creep];
                if(creep) {
                    // TODO: Check if cre
                    creep.suicide();
                }
            }
        }
        else {
            this.state = 'killed';
        }
    }

    private handleCreep(room: Room)
    {
        const creep = Game.creeps[this.meta.creep];
        const inputLabs = this.meta.inputLabs.map((id: string) => Game.getObjectById(id));
        if(!creep) SpawnsHelper.requestSpawn(this.ID, room, [CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE], {role: 'labMonkey'}, 'creep');
        else if(creep && creep.spawning) {}
        else if(creep) {
            if(this.meta.state === 'filling') {
                let lab, compound;
                if(inputLabs[0].mineralAmount < this.meta.amountToProduce) {
                    lab = inputLabs[0];
                    compound = this.meta.input[0].compound;
                }
                else if(inputLabs[1].mineralAmount < this.meta.amountToProduce) {
                    lab = inputLabs[1];
                    compound = this.meta.input[1].compound;
                }
                if(inputLabs[0].mineralAmount === this.meta.amountToProduce && inputLabs[1].mineralAmount == this.meta.amountToProduce) {
                    this.meta.state = 'producing';
                }
                // console.log(JSON.stringify(inputLabs));
                // console.log(JSON.stringify(inputLabs));
                if(lab && compound) {
                    if(_.sum(creep.carry) === 0) {
                        const amountInStorage = room.storage ? room.storage.store[compound as ResourceConstant] || 0 : 0;
                        const amountInTerminal = room.terminal ? room.terminal.store[compound as ResourceConstant] || 0 : 0;
                        const target = amountInStorage > 0 ? room.storage : room.terminal;
                        if(target && creep.pos.isNearTo(target)) creep.withdraw(target, compound)
                        else if(target) creep.moveTo(target);
                    }
                    else {
                        if(creep.pos.isNearTo(lab)) creep.transfer(lab, compound);
                        else creep.moveTo(lab);
                    }
                }
            }
            else {
                if(_.sum(creep.carry) === 0) {
                    const producing = this.meta.state === 'filling' || this.meta.state === 'producing';
                    const labs = room.labs.filter((l:StructureLab) => this.meta.inputLabs.indexOf(l.id) < 0 /* && l.energy === 0 */ && (l.mineralAmount > (producing ? 50 : 0) || l.mineralType !== this.meta.boostToProduce));
                    if(labs.length) {
                        const target = creep.pos.findClosestByRange(labs);
                        if(target && creep.withdraw(target, target.mineralType as ResourceConstant) === ERR_NOT_IN_RANGE) {
                            creep.moveTo(target);
                        }
                    }
                    else {
                        if(BlueprintsHelper.labHandlerSpots['bunkers']['1'][0]) {
                            const spot = BlueprintsHelper.labHandlerSpots['bunkers']['1'][0];
                            const x =  room.memory.centerX + spot.x;
                            const y =  room.memory.centerY + spot.y;
                            if(creep.pos.x !== spot.x || creep.pos.y !== spot.y) creep.moveTo(x, y);
                        }
                        // Check if there is a dedicated parking spot for this creep.
                        // if there is, and it's in range of 1 to the terminal, and range 1 of the storage, the creep can do some terminal tasks :)

                        // Check if there are boosts queued to deliver to the labs for boosting creeps (WE NEED A QUEUE FOR THIS!!)
                    }
                }
                else {
                    let target;
                    if(creep.room.storage) target = creep.room.storage;
                    else if(creep.room.terminal) target = creep.room.terminal;
                    if(target) {
                        if(creep.pos.isNearTo(target)) {
                            for(let i in creep.carry) {
                                creep.transfer(target, i as ResourceConstant);
                            }
                        }
                        else {
                            creep.moveTo(target);
                        }
                    }
                }
            }
        }
        if(this.meta.boostToProduce && this.meta.state === 'producing') {
            if(inputLabs.length && inputLabs[0].mineralAmount > 0 && inputLabs[1].mineralAmount > 0) {
                const extraLabs = room.labs.filter((l:StructureLab) => this.meta.inputLabs.indexOf(l.id) < 0 /* && l.energy === 0 */ && l.cooldown === 0);
                // console.log(extraLabs.length)
                for(let l of extraLabs) {
                    l.runReaction(inputLabs[0], inputLabs[1]);
                }
            }
        }
        if(this.meta.state == 'producing' && inputLabs[0].mineralAmount === 0 && inputLabs[1].mineralAmount === 0) {
            this.meta.state = 'idle';
            this.meta.boostToProduce = null;
        }
    }

    private creepEmptyCarry(creep: Creep)
    {
        const carry = _.sum(creep.carry);
        if(carry > 0) {
            if(creep.room.storage !== undefined && creep.room.terminal !== undefined) {
                const target = creep.room.storage ? creep.room.storage : creep.room.terminal;
                if(!creep.pos.isNearTo(target)) {
                    creep.moveTo(target);
                }
                else {
                    for (let i in creep.carry) {
                        creep.transfer(target, i as ResourceConstant);
                    }
                }
            }
            else {
                // TODO: Find closest room and deliver there!
            }
        }
    }

    private decideBoostToProduce(room: Room)
    {
        this.meta.boostToProduce = BoostsHelper.defineBoostToCreate(room);
        this.meta.input = [];
        this.meta.amountToProduce = 0;

        if(this.meta.boostToProduce) {
            const ingredients = global.BOOST_COMPONENTS[this.meta.boostToProduce];
            for(let i of ingredients) {
                this.meta.input.push({
                    compound: i,
                    delivered: 0
                });
            }
            this.meta.amountToProduce = 3000;
            this.meta.state = 'filling';
        }
    }

    private defineInputLabs(room: Room) : string[]
    {
        let result: string[] = [];
        if(room.labs.length > 2) {
            // TODO: Check if the labs are empty, but the check above (length > 2) needs to be set to a higher level, and use te same check
            let labs = room.labs;
            let labRanges = [];
            for (const labTarget of labs) {
                const labTargetsInRange = labTarget.pos.findInRange(labs, 2);

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

            result.push(labRanges[0].lab.id)
            result.push(labRanges[1].lab.id)

        }

        return result;
    }
}

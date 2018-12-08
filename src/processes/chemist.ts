import {Process} from '../ROS/process';
import {SpawnsHelper} from '../helpers/spawns';
import { Room_Bootstrap } from './room_bootstrap';

/**
 *
 * META:
 * - room
 *
 * INTERNAL META:
 * - reaction
 * - reactionDone
 * - reacting
 * - labs
 * - labCheck
 *
 *
 */

export class Chemist extends Process
{

    // meta: {
    //     initialized: boolean,
    //     room: string,
    //     reaction: boolean,
    //     reactionDone: boolean
    // }

    public run()
    {
        const room: Room = Game.rooms[this.meta.room];
        if(!room || !room.labs || room.labs.length < 3) {
            this.state = 'killed';
        }
        else {
            try {
                this._run(room);
            }
            catch(e) {
                console.log(`Chemist.ts error`);
            }
        }
    }

    private _run(room: Room)
    {
        if(!this.meta.reaction || this.meta.reactionDone) {
            this.meta.reaction = this.defineReaction(room);
            if(this.meta.reaction) {
                this.meta.ingredients = global.BOOST_COMPONENTS[this.meta.reaction];
            }
        }
        if(this.meta.reaction) {
            if(!this.meta.labs || this.meta.labCheck + 100 > Game.time) {
                this.defineSupplyLabs(room);
            }
            if(this.meta.labs) {
                const labs: StructureLab[] = this.meta.labs.map((s: string) => Game.getObjectById(s));
                if(labs[0].mineralAmount === labs[0].mineralCapacity && labs[1].mineralAmount === labs[1].mineralCapacity) {
                    this.meta.reacting = true;
                }
                else if(labs[0].mineralAmount === 0 || labs[1].mineralAmount === 0) {
                    this.meta.reacting = false;
                }
            }
        }
    }

    private handleCreep(room: Room)
    {
        const creep = Game.creeps[this.meta.creep];
        if(!creep) {
            if(SpawnsHelper.spawnAvailable(room)) {
                SpawnsHelper.requestSpawn(this.ID, room, [
                    CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE
                ], {role: 'chemist'},'creep');
            }
        }
        else if(creep && creep.spawning) {

        }
        else if(creep) {

        }
    }

    private defineSupplyLabs(room: Room)
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
        if(labRanges.length) {
            labRanges.sort((a, b) =>
                b.labsInRange
                -
                a.labsInRange
            );

            room.labs[0].room.visual.circle(labRanges[0].lab.pos, {stroke: 'red'});
            room.labs[1].room.visual.circle(labRanges[1].lab.pos, {stroke: 'red'});
            this.meta.labs.push(labRanges[0].lab.id);
            this.meta.labs.push(labRanges[1].lab.id);
        }
    }

    private defineReaction(room: Room) : string|null
    {
        if(room.storage) {
            let minerals: {resource: string, amount: number}[] = [];
            for(let x in global.BOOST_COMPONENTS) {
                minerals.push({
                    resource: x,
                    amount: room.storage.store[x as ResourceConstant] || 0
                });
            }

            let filteredMinerals = minerals.filter((m) => m.amount < 3000);
            if(!filteredMinerals.length) {
                filteredMinerals = minerals.filter((m) => m.amount < 6000);
            }
            if(!filteredMinerals.length) {
                filteredMinerals = minerals.filter((m) => m.amount < 12000);
            }
            if(filteredMinerals.length) {
                for(let i in filteredMinerals) {
                    const ingredients: ResourceConstant[] = global.BOOST_COMPONENTS[filteredMinerals[i].resource];
                    let fAmount = room.storage.store[ingredients[0]] || 0;
                    let sAmount = room.storage.store[ingredients[1]] || 0;
                    if(room.terminal) {
                        fAmount += room.terminal.store[ingredients[0]] || 0;
                        sAmount += room.terminal.store[ingredients[1]] || 0;
                    }
                    if(fAmount >= 3000 && sAmount >= 3000) {
                        return filteredMinerals[i].resource;
                    }
                }
            }
            else {
                return _.min(minerals, (m) => m.amount).resource;
            }
        }

        return null;
    }
}

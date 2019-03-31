import { Process } from "ROS/process";
import {MapHelper} from "../helpers/map";

export class Squad extends Process
{

    private init()
    {
        this.meta.ready = false;
        this.meta.inFormation = false;
        this.meta.initialized = true;
    }

    public run()
    {
        if(!this.meta.initialized) {
            this.init();
        }
        const bodyParts = [MOVE,ATTACK];
        const room = Game.rooms[this.meta.rooms];

        if(room && room.controller) {
            if(this.allSpawned(room.controller)) {
                if(!this.meta.ready) {
                    this.meta.ready = true;
                }
                const creeps = this.meta.creeps.map((n: string) => Game.creeps[n]);
                if(!this.meta.inFormation) {
                    this.moveToFormation(creeps);
                }
                else {
                    this.handleCreeps(creeps);
                }
            }
            else {
                // Spawn and stuff


            }
        }
    }

    private allSpawned(cc: StructureController) : boolean
    {
        return this.meta.creeps.filter((c: string) => Game.creeps[c] && !Game.creeps[c].spawning && Game.creeps[c].pos.inRangeTo(cc, 5)).length === 4;
    }

    /**
     * Formation:
     * 01
     * 23
     *
     * Creep_0 paths and makes sure there is one spot on the right of him
     */
    private handleCreeps(creeps: Creep[])
    {
        if(!this.meta.route) {
            const rooms: any = MapHelper.findRoute(this.meta.room, this.meta.target, {
                ignoreSK: false, prioritizeHighways:true
            });
            if(rooms && rooms.length) {
                this.meta.rooms = rooms;
            }
            else {
                console.log(`FAILED TO FIND A ROUTE FROM ${this.meta.room} TO ${this.meta.target}`);
            }
        }
        if(!this.meta.directions) {
            // Calculate the path for in the current room.
            // Store a string with direction integers. Slice the first each tick and use creep.move() with
            // the resulting integer.
        }
    }

    private moveToFormation(creeps: Creep[])
    {
        let valid = true;
        if(creeps[1].pos.x !== creeps[0].pos.x + 1 && creeps[1].pos.y !== creeps[0].pos.y) {
            valid = false;
            creeps[1].moveTo(creeps[0].pos.x + 1, creeps[0].pos.y, {maxRooms: 1});
        }
        if(creeps[2].pos.x !== creeps[0].pos.x && creeps[2].pos.y !== creeps[0].pos.y + 1) {
            valid = false;
            creeps[2].moveTo(creeps[0].pos.x, creeps[0].pos.y + 1, {maxRooms: 1});
        }
        if(creeps[3].pos.x !== creeps[0].pos.x + 1 && creeps[3].pos.y !== creeps[0].pos.y + 1) {
            valid = false;
            creeps[3].moveTo(creeps[0].pos.x + 1, creeps[0].pos.y + 1, {maxRooms: 1});
        }
        if(valid) {
            this.meta.inFormation = true;
        }
    }
}

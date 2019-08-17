import {Process} from '../ROS/process'
import {SpawnsHelper} from '../helpers/spawns'
import {BoostsHelper} from "../helpers/boosts";
import { MarketHelper } from 'helpers/Market';

// META
// room

// TODO: Each sub process now creates & suicides it's own creeps. this is not needed
export class AutoMakeBoosts extends Process
{
    private init()
    {

        this.meta.initialized = true;
    }

    private kill()
    {
        this.state = 'killed';
    }

    public run()
    {
        if(this.meta.room === 'W12N19') {
            //global.OS.kernel.addProcess('handleLabs', {room: 'W12N19'}, 0)
            this.state = 'killed';
        }
        if(typeof this.meta.initialized === 'undefined') {
            this.init();
        }
        const room: Room = Game.rooms[this.meta.room];

        if(room && room.storage && room.labs.length) {
            try {
                this.handle(room);
            }
            catch(e) {
                console.log(`Error in autoMakeBoosts: ${e.message}`);
            }
        }
        else {
            this.kill();
        }
    }

    private requestResources(room: Room, resource: ResourceConstant) : boolean
    {
        return false;

        // for(let i in Game.rooms) {
        //     const r = Game.rooms[i];
        //     if(r.controller && r.controller.my && r.terminal && r.storage) {
        //         const terminalAmount = r.terminal.store[resource] || 0;
        //         const storageAmount = r.storage.store[resource] || 0;
        //         if(terminalAmount + storageAmount > 8000) {
        //             if(!global.OS.kernel.hasProcessForNameAndMetaKeyValue('sendResources', 'target', room.name) && !global.OS.kernel.hasProcessForNameAndMetaKeyValue('sendResources', 'room', r.name) && !global.OS.kernel.hasProcessForNameAndMetaKeyValue('haulResources', 'room', r.name)) {
        //                 global.OS.kernel.addProcess('sendResources', {room: r.name, target: room.name, resource: resource, amount: 3000}, this.ID);
        //             }
        //         }
        //     }
        // }

        // return false;
    }

    private handle(room: Room)
    {
        if(room.storage && !global.OS.kernel.hasProcessForNameAndMetaKeyValue('stockBoostsLab', 'room', room.name) && !global.OS.kernel.hasProcessForNameAndMetaKeyValue('makeBoosts', 'room', room.name) && !global.OS.kernel.hasProcessForNameAndMetaKeyValue('emptyLabs', 'room', room.name)) {
            const reaction = BoostsHelper.defineBoostToCreate(room);
            if(reaction) {
                global.OS.kernel.addProcess('makeBoosts', {room: room.name, boost: reaction, amount: 3000}, this.ID);
            }
        }
    }
}

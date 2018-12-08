import {Process} from '../ROS/process'
import {SpawnsHelper} from '../helpers/spawns'

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

    private findBuyOrder(room: Room, resource: ResourceConstant)
    {

    }

    private requestResources(room: Room, resource: ResourceConstant) : boolean
    {
        return true;

        // for(let i in Game.rooms) {
        //     const r = Game.rooms[i];
        //     if(r.controller && r.controller.my && r.terminal && r.storage) {
        //         const terminalAmount = r.terminal.store[resource];
        //         const storageAmount = r.storage.store[resource];
        //         if(terminalAmount && storageAmount && terminalAmount + storageAmount > 8000) {
        //             if(!global.OS.kernel.hasProcessForNameAndMetaKeyValue('sendResources', 'target', room.name) && !global.OS.kernel.hasProcessForNameAndMetaKeyValue('sendResources', 'room', r.name) && !global.OS.kernel.hasProcessForNameAndMetaKeyValue('haulResources', 'room', room.name)) {
        //                 global.OS.kernel.addProcess('sendResources', {room: r.name, target: room.name, resource: resource, amount: 3000}, this.ID);
        //             }
        //         }
        //     }
        // }

        // return false;
    }

    private handle(room: Room)
    {
        if(room.storage && !global.OS.kernel.hasProcessForNameAndMetaKeyValue('makeBoosts', 'room', room.name) && !global.OS.kernel.hasProcessForNameAndMetaKeyValue('emptyLabs', 'room', room.name)) {
            const reaction = this.defineReaction(room);
            if(reaction) {
                global.OS.kernel.addProcess('makeBoosts', {room: room.name, boost: reaction, amount: 3000}, 0);
            }
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

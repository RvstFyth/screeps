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

    private handle(room: Room)
    {
        if(room.storage && !global.OS.kernel.hasProcessForNameAndMetaKeyValue('makeBoosts', 'room', room.name) && !global.OS.kernel.hasProcessForNameAndMetaKeyValue('emptyLabs', 'room', room.name)) {
            let triggered = false;
            for(let i in global.BOOST_COMPONENTS) {

                const storageAmount = room.storage.store[i as ResourceConstant];
                if(!storageAmount || storageAmount < 3000) {
                    // check if there are enough ingredients in terminal AND storage
                    // if there are enough, trigger a process to create the boos
                    const ingredients: ResourceConstant[] = global.BOOST_COMPONENTS[i];
                    const fAmount = room.storage.store[ingredients[0]];
                    const sAmount = room.storage.store[ingredients[1]];
                    if(fAmount && fAmount >= 3000 && sAmount && sAmount >= 3000) {
                        global.OS.kernel.addProcess('makeBoosts', {room: room.name, boost: i, amount: 3000}, 0);
                        break;
                    }
                    else {
                        if(room.terminal) {
                            const fAmount = room.terminal.store[ingredients[0]];
                            const sAmount = room.terminal.store[ingredients[1]];
                            if(fAmount && fAmount >= 3000 && sAmount && sAmount >= 3000) {
                                global.OS.kernel.addProcess('makeBoosts', {room: room.name, boost: i, amount: 3000}, 0);
                                triggered = true;
                                break;
                            }
                        }
                    }
                }
                else {
                    // Go fishing or something
                }
            }
            // Als er nog geen process getriggerd is, check op het aantal van 6000
            if(!triggered) {
                for(let i in global.BOOST_COMPONENTS) {

                    const storageAmount = room.storage.store[i as ResourceConstant];
                    if(!storageAmount || storageAmount < 6000) {
                        // check if there are enough ingredients in terminal AND storage
                        // if there are enough, trigger a process to create the boos
                        const ingredients: ResourceConstant[] = global.BOOST_COMPONENTS[i];
                        const fAmount = room.storage.store[ingredients[0]];
                        const sAmount = room.storage.store[ingredients[1]];
                        if(fAmount && fAmount >= 6000 && sAmount && sAmount >= 6000) {
                            global.OS.kernel.addProcess('makeBoosts', {room: room.name, boost: i, amount: 3000}, 0);
                            break;
                        }
                        else {
                            if(room.terminal) {
                                const fAmount = room.terminal.store[ingredients[0]];
                                const sAmount = room.terminal.store[ingredients[1]];
                                if(fAmount && fAmount >= 6000 && sAmount && sAmount >= 6000) {
                                    global.OS.kernel.addProcess('makeBoosts', {room: room.name, boost: i, amount: 3000}, 0);
                                    triggered = true;
                                    break;
                                }
                            }
                        }
                    }
                    else {
                        // Go fishing or something
                    }
                }
            }
        }
    }
}

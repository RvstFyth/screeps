import {Process} from '../ROS/process';

// OS.kernel.addProcess('resources', {room: 'W56S33', 0);
export class Resources extends Process
{

    private init(roomName: string)
    {
        if(!Memory.resourceRequests) {
            Memory.resourceRequests = {};
        }
        this.meta.initialized = true;
    }

    public run()
    {
        try {
            this.run2();
        }
        catch(e) {
            console.log(`Resources process crashed ${JSON.stringify(e)}`);
        }
    }

    private run2()
    {
        if(!this.meta.initialized) {
            this.init(this.meta.room);
        }

        const base = Object.keys(MINERAL_MIN_AMOUNT);
        const room = Game.rooms[this.meta.room];
        const mineral = room.find(FIND_MINERALS)[0];

        if(room && room.controller && room.controller.my && mineral && room.storage && room.terminal && room.terminal.my && !global.OS.kernel.hasProcessForNameAndMetaKeyValue('emptyOwnedRoom', 'room', room.name)) {
            for(let r of base) {
                const bAmount = (room.terminal.store[r as ResourceConstant] || 0) + (room.storage.store[r as ResourceConstant] || 0);
                if(bAmount < 4000) {
                    if(!Memory.resourceRequests[r]) Memory.resourceRequests[r] = [];
                    if(Memory.resourceRequests[r].indexOf(room.name) < 0) Memory.resourceRequests[r].push(room.name);
                }
                else {
                    if(Memory.resourceRequests[r] && Memory.resourceRequests[r].length) {
                        const index = Memory.resourceRequests[r].indexOf(room.name);
                        if(index > -1) {
                            Memory.resourceRequests[r].splice(index, 1);
                        }
                    }
                    if(bAmount > 20000 && !global.OS.kernel.hasProcessForNameAndMetaKeyValue('sendResources', 'room', room.name) && Memory.resourceRequests[r] && Memory.resourceRequests[r].length) {
                        for(let n in Memory.resourceRequests[r]) {
                            const targetR = Game.rooms[Memory.resourceRequests[r][n]];
                            if(!targetR || !targetR.controller || !targetR.controller.my || !targetR.terminal || !targetR.terminal.my) {
                                const index = Memory.resourceRequests[r].indexOf(n);
                                if(index > -1) {
                                    Memory.resourceRequests[r].splice(index, 1);
                                }
                                continue;
                            }
                            const freeSpaceInTerminal = targetR.terminal.storeCapacity - _.sum(targetR.terminal.store);
                            if(freeSpaceInTerminal > 30000 && !global.OS.kernel.hasProcessForNameAndMetaKeyValue('sendResources', 'target', Memory.resourceRequests[r][n])) {
                                global.OS.kernel.addProcess('sendResources', {room: room.name, target: Memory.resourceRequests[r][n], resource: r, amount: 6000}, 0);
                                const index = Memory.resourceRequests[r].indexOf(n);
                                if(index > -1) {
                                    Memory.resourceRequests[r].splice(index, 1);
                                }
                                break;
                            }
                        }
                    }
                }
            }
        }
    }
}

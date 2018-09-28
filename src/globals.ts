global.BOOST_COMPONENTS = {
        //Base
        [RESOURCE_GHODIUM]: [RESOURCE_ZYNTHIUM_KEANITE, RESOURCE_UTRIUM_LEMERGITE],
        [RESOURCE_HYDROXIDE]: [RESOURCE_OXYGEN, RESOURCE_HYDROGEN],
        [RESOURCE_ZYNTHIUM_KEANITE]: [RESOURCE_ZYNTHIUM, RESOURCE_KEANIUM],
        [RESOURCE_UTRIUM_LEMERGITE]: [RESOURCE_UTRIUM, RESOURCE_LEMERGIUM],
        //Tier 1
        [RESOURCE_GHODIUM_HYDRIDE]: [RESOURCE_GHODIUM, RESOURCE_HYDROGEN],
        [RESOURCE_GHODIUM_OXIDE]: [RESOURCE_GHODIUM, RESOURCE_OXYGEN],
        [RESOURCE_ZYNTHIUM_HYDRIDE]: [RESOURCE_ZYNTHIUM, RESOURCE_HYDROGEN],
        [RESOURCE_ZYNTHIUM_OXIDE]: [RESOURCE_ZYNTHIUM, RESOURCE_OXYGEN],
        [RESOURCE_LEMERGIUM_OXIDE]: [RESOURCE_LEMERGIUM, RESOURCE_OXYGEN],
        [RESOURCE_LEMERGIUM_HYDRIDE]: [RESOURCE_LEMERGIUM, RESOURCE_HYDROGEN],
        [RESOURCE_KEANIUM_OXIDE]: [RESOURCE_KEANIUM, RESOURCE_OXYGEN],
        [RESOURCE_KEANIUM_HYDRIDE]: [RESOURCE_KEANIUM, RESOURCE_HYDROGEN],
        [RESOURCE_UTRIUM_HYDRIDE]: [RESOURCE_UTRIUM, RESOURCE_HYDROGEN],
        [RESOURCE_UTRIUM_OXIDE]: [RESOURCE_UTRIUM, RESOURCE_OXYGEN],
        //Tier 2
        [RESOURCE_GHODIUM_ACID]: [RESOURCE_GHODIUM_HYDRIDE, RESOURCE_HYDROXIDE],
        [RESOURCE_GHODIUM_ALKALIDE]: [RESOURCE_GHODIUM_OXIDE, RESOURCE_HYDROXIDE],
        [RESOURCE_ZYNTHIUM_ACID]: [RESOURCE_ZYNTHIUM_HYDRIDE, RESOURCE_HYDROXIDE],
        [RESOURCE_ZYNTHIUM_ALKALIDE]: [RESOURCE_ZYNTHIUM_OXIDE, RESOURCE_HYDROXIDE],
        [RESOURCE_LEMERGIUM_ALKALIDE]: [RESOURCE_LEMERGIUM_OXIDE, RESOURCE_HYDROXIDE],
        [RESOURCE_LEMERGIUM_ACID]: [RESOURCE_LEMERGIUM_HYDRIDE, RESOURCE_HYDROXIDE],
        [RESOURCE_KEANIUM_ALKALIDE]: [RESOURCE_KEANIUM_OXIDE, RESOURCE_HYDROXIDE],
        [RESOURCE_KEANIUM_ACID]: [RESOURCE_KEANIUM_HYDRIDE, RESOURCE_HYDROXIDE],
        [RESOURCE_UTRIUM_ACID]: [RESOURCE_UTRIUM_HYDRIDE, RESOURCE_HYDROXIDE],
        [RESOURCE_UTRIUM_ALKALIDE]: [RESOURCE_UTRIUM_OXIDE, RESOURCE_HYDROXIDE],
        //Tier 3
        [RESOURCE_CATALYZED_GHODIUM_ALKALIDE]: [RESOURCE_GHODIUM_ALKALIDE, RESOURCE_CATALYST],
        [RESOURCE_CATALYZED_GHODIUM_ACID]: [RESOURCE_GHODIUM_ACID, RESOURCE_CATALYST],
        [RESOURCE_CATALYZED_ZYNTHIUM_ACID]: [RESOURCE_ZYNTHIUM_ACID, RESOURCE_CATALYST],
        [RESOURCE_CATALYZED_ZYNTHIUM_ALKALIDE]: [RESOURCE_ZYNTHIUM_ALKALIDE, RESOURCE_CATALYST],
        [RESOURCE_CATALYZED_LEMERGIUM_ALKALIDE]: [RESOURCE_LEMERGIUM_ALKALIDE, RESOURCE_CATALYST],
        [RESOURCE_CATALYZED_LEMERGIUM_ACID]: [RESOURCE_LEMERGIUM_ACID, RESOURCE_CATALYST],
        [RESOURCE_CATALYZED_KEANIUM_ALKALIDE]: [RESOURCE_KEANIUM_ALKALIDE, RESOURCE_CATALYST],
        [RESOURCE_CATALYZED_KEANIUM_ACID]: [RESOURCE_KEANIUM_ACID, RESOURCE_CATALYST],
        [RESOURCE_CATALYZED_UTRIUM_ACID]: [RESOURCE_UTRIUM_ACID, RESOURCE_CATALYST],
        [RESOURCE_CATALYZED_UTRIUM_ALKALIDE]: [RESOURCE_UTRIUM_ALKALIDE, RESOURCE_CATALYST]
};

global.populateLOANlist = function(LOANuser = "LeagueOfAutomatedNations", LOANsegment = 99) {
    if ((typeof RawMemory.setActiveForeignSegment == "function") && !!~['shard0','shard1','shard2'].indexOf(Game.shard.name)) { // To skip running in sim or private servers which prevents errors
        if ((typeof Memory.lastLOANtime == "undefined") || (typeof global.LOANlist == "undefined")) {
            Memory.lastLOANtime = Game.time - 1001;
            global.LOANlist = [];
            if (typeof Memory.LOANalliance == "undefined") Memory.LOANalliance = "";
        }

        if (Game.time >= (Memory.lastLOANtime+1000)) {
            RawMemory.setActiveForeignSegment(LOANuser, LOANsegment);
        }

        if ((Game.time >= (Memory.lastLOANtime+1001)) && (typeof RawMemory.foreignSegment != "undefined") && (RawMemory.foreignSegment.username == LOANuser) && (RawMemory.foreignSegment.id == LOANsegment)) {
            Memory.lastLOANtime = Game.time;
            if (RawMemory.foreignSegment.data == null) return false;
            else {
                let LOANdata = JSON.parse(RawMemory.foreignSegment.data);
                let LOANdataKeys = Object.keys(LOANdata);
                let allMyRooms = _.filter(Game.rooms, (aRoom) => (typeof aRoom.controller != "undefined") && aRoom.controller.my);
                if (allMyRooms.length == 0) {
                    global.LOANlist = [];
                    Memory.LOANalliance = "";
                    return false;
                }
                let myUsername = 'GimmeCookies';
                //myUsername = allMyRooms[0].controller.owner.username;
                for (let iL = (LOANdataKeys.length-1); iL >= 0; iL--) {
                    if (LOANdata[LOANdataKeys[iL]].indexOf(myUsername) >= 0) {
                        //console.log("Player",myUsername,"found in alliance",LOANdataKeys[iL]);
                        global.LOANlist = LOANdata[LOANdataKeys[iL]];
                        Memory.LOANalliance = LOANdataKeys[iL].toString();
                        return true;
                    }
                }
                return false;
            }
        }
        return true;
    } else {
        global.LOANlist = [];
        Memory.LOANalliance = "";
        return false;
    }
}


global.resourceStats = function()
{
    let output = '';
    let mineralCount: any = {
        H:0, O:0, U:0, L:0, K:0, Z:0, X:0
    };
    for(let i in Game.rooms) {
        const room: Room = Game.rooms[i];
        if(room && room.controller && room.controller.my) {
            const mineral = room.find(FIND_MINERALS)[0];
            output += `${room.name}: ${mineral.mineralType} | Energy: ${room.energyAvailable} / ${room.energyCapacityAvailable} | Storage: ${room.storage ? Math.floor(_.sum(room.storage.store)/1000).toString() + `K (E: ${Math.floor(room.storage.store[RESOURCE_ENERGY]/1000)}K)` : '<i>n.a</i>'} \n`;
            mineralCount[mineral.mineralType]++;
        }
    }
    output += '\n';
    for(let r in mineralCount) {
        const color = mineralCount[r] === 0 ? 'red' : (mineralCount[r] < 2 ? 'orange' : 'green');
        output += `<span style="color:${color}">${mineralCount[r]} ${r} rooms</span> \n`
    }
    console.log(output);
}

global.roomStats = function()
{
    let output = '';
    for(let i in Game.rooms) {
        const room = Game.rooms[i];
        if(room.controller && room.controller.my) {
            // Count remotes
            const remoteProcesses = global.OS.kernel.getProcessForNameAndMetaKeyValueCLI('remoteMining', 'room', room.name);
            output += `${room.name} | ${remoteProcesses.length} remoteMining ops | RCL ${room.controller.level} (${((room.controller.progress / room.controller.progressTotal) * 100).toFixed(1)})% \n`
        }
    }

    console.log(output);
}

global.gcl = function()
{
    console.log(`GCL: ${Game.gcl.level} (${((Game.gcl.progress / Game.gcl.progressTotal) * 100).toFixed(2)}%)`);
}

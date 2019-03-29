global.LAB_STATE = {
    IDLE: 0,
    SUPPLY: 1,
    REACTING: 2,
    BOOSTING: 3
};

global.UNIT_COST = (body: BodyPartConstant[]) => _.sum(body, (p: BodyPartConstant) => BODYPART_COST[p]);

global.killProcess = function(pID: number) {
    // TODO: Proper solution
    for(let i in Memory.ROS.processes) {
        if(Memory.ROS.processes[i].ID === pID) {
            Memory.ROS.processes[i] = undefined;
        }
    }
};

global.RECIPES = {};
for (const a in REACTIONS) {
	for (const b in REACTIONS[a]) {
		global.RECIPES[REACTIONS[a][b]] = [a, b];
	}
}

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

"use strict";
// League Of Automated Nations allied users list by Kamots
// Provides global.LOANlist as array of allied usernames. Array is empty if not in an alliance, but still defined.
// Updates on 2nd run and then every 1001 ticks or if the global scope gets cleared.
// Usage: After you require this file, just add this to anywhere in your main loop to run every tick: global.populateLOANlist();
// global.LOANlist will contain an array of usernames after global.populateLOANlist() runs twice in a row (two consecutive ticks).
// Memory.LOANalliance will contain the alliance short name after global.populateLOANlist() runs twice in a row (two consecutive ticks).
global.populateLOANlist = function(LOANuser = "LeagueOfAutomatedNations", LOANsegment = 99) {
    if ((typeof RawMemory.setActiveForeignSegment == "function") && !!~['shard0','shard1','shard2','shard3'].indexOf(Game.shard.name)) { // To skip running in sim or private servers which prevents errors
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
                let myUsername = "GimmeCookies"; // Blank! Will be auto-filled.
                const LOANdata = JSON.parse(RawMemory.foreignSegment.data);
                const  LOANdataKeys = Object.keys(LOANdata);
                // let allMyRooms = _.filter(Game.rooms, (aRoom) => aRoom.controller && aRoom.controller.my);
                // if (allMyRooms.length == 0) {
                //     const allMyCreeps = _.filter(Game.creeps, (creep) => true);
                //     if (allMyCreeps.length == 0) {
                //         global.LOANlist = [];
                //         Memory.LOANalliance = "";
                //         return false;
                //     } else myUsername = allMyCreeps[0].owner.username;
                // } else myUsername = allMyRooms[0] && allMyRooms[0].controller && allMyRooms[0].controller.owner && allMyRooms[0].controller.owner.username ? allMyRooms[0].controller.owner.username : '';
                for (let iL = (LOANdataKeys.length-1); iL >= 0; iL--) {
                    if (LOANdata[LOANdataKeys[iL]].indexOf(myUsername) >= 0) {
                        //console.log("Player",myUsername,"found in alliance",LOANdataKeys[iL]);
                        const disavowed = ['BADuser1','Zenga'];
                        global.LOANlist = LOANdata[LOANdataKeys[iL]];
                        global.LOANlist = global.LOANlist.filter(function(uname: string){
                            return disavowed.indexOf(uname) < 0;
                        });
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

/**
 * This method relies on the fixed length of the resource string.
 * This only works for tier 1 => 3 and will break with higher numbers
 * T1 = 2  Math.ceil(2 / 2) = 1
 * T2 = 4  Math.ceil(4 / 2) = 2
 * T3 = 5  Math.ceil(5 / 2) = 3
 * @param r ResourceConstant
 */
global.boostTier = (r: ResourceConstant) => Math.ceil(r.length / 2);

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

global.defineTier = function(t: string)
{
    return t.length +1;
}

/**
 * Clear the in-game console
 * Usage: `clear()` in the console
 */
global.clear = function()
{
   console.log("<script>angular.element(document.getElementsByClassName('fa fa-trash ng-scope')[0].parentNode).scope().Console.clear()</script>")
}

global.gcl = function()
{
    console.log(`GCL: ${Game.gcl.level} (${((Game.gcl.progress / Game.gcl.progressTotal) * 100).toFixed(2)}%)`);
}

global.highestBuy = function(resource: ResourceConstant)
{
    const orders = Game.market.getAllOrders({type: ORDER_BUY, resourceType: resource}).sort((a,b) => b.price - a.price);
    if(orders && orders.length) {
        const iEnd: number = orders.length > 3 ? 3 : orders.length;
        let msg: string = `Found ${orders.length} buy orders for ${resource}`;
        for(let i = 0; i < iEnd; i++) {
            msg += `\n ${orders[i].price} C`;
        }
        console.log(msg);
    }

    console.log(`No buy orders found for ${resource}`);
}

global.buyEnergy = function(price: number, amount: number, room: string)
{
    Game.market.createOrder(ORDER_BUY, RESOURCE_ENERGY, price, amount, room);
}

global.listSellOrders = function (resource: ResourceConstant, maxOrders: number)
{
    const orders = Game.market.getAllOrders({type: ORDER_SELL, resourceType: resource}).sort((a,b) => a.price - b.price);
    if(orders.length) {
        const max = maxOrders || (orders.length > 4 ? 4 : ORDER_SELL.length);
        let msg = `Listing orders for ${resource}. ${orders.length} orders found`;
        for(let i = 0; i < max; i++) {
            msg += `\n Price: ${orders[i].price} | Amount: ${orders[i].remainingAmount} | id: ${orders[i].id}`;
        }
        console.log(msg);
    }
}

global.listBuyOrders = function (resource: ResourceConstant, maxOrders: number)
{
    const orders = Game.market.getAllOrders({type: ORDER_BUY, resourceType: resource}).sort((a,b) => b.price - a.price);
    if(orders.length) {
        const max = maxOrders || (orders.length > 4 ? 4 : orders.length);
        let msg = `Listing orders for ${resource}. ${orders.length} orders found`;
        for(let i = 0; i < max; i++) {
            msg += `\n Price: ${orders[i].price} | Amount: ${orders[i].remainingAmount} | id: ${orders[i].id}`;
        }
        console.log(msg);
    }
}

global.defineReaction = function (roomname: string) : string|null
{
    const room = Game.rooms[roomname];

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

global.cpu = function()
{
    let msg = '';
    if(Memory.cpu.last === 0) {
        msg += `Measured over ${Memory.cpu.cnt} ticks: ${(Memory.cpu.used / Memory.cpu.cnt).toFixed(3)} CPU`;
    }
    else {
        msg += `Last 100 ticks: ${Memory.cpu.last.toFixed(3)} CPU`;
    }

    console.log(msg);
    console.log(JSON.stringify(Memory.cpu));
}

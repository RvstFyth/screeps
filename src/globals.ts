import { MapHelper } from "helpers/map";
import {ConsoleHelper} from 'helpers/console'
global.LAB_STATE = {
    IDLE: 0,
    SUPPLY: 1,
    REACTING: 2,
    BOOSTING: 3
};

ConsoleHelper.registerCommand('test', (a:any,b:any,c:any) => {console.log([a,b,c])}, 'Test Test Test Test Test Test Test');
ConsoleHelper.registerCommand('testAAA', (a:any,b:any,c:any) => {console.log([a,b,c])}, '2222222222 Test Test Test Test Test Test Test');
global.cli = ConsoleHelper;

global.UNIT_COST = (body: BodyPartConstant[]) => _.sum(body, (p: BodyPartConstant) => BODYPART_COST[p]);

global.killProcess = function(pID: number) {
    // TODO: Proper solution
    for(let i in Memory.ROS.processes) {
        if(Memory.ROS.processes[i].ID === pID) {
            Memory.ROS.processes[i] = undefined;
        }
    }
};

global.SetBlueprint = function (roomName: string, type: string, key: string, centerX: number, centerY: number) {
    const room = Game.rooms[roomName];
    if (room && room.controller && room.controller.my) {
        room.memory.blueprintType = type;
        room.memory.blueprintKey = key;
        room.memory.centerX = centerX;
        room.memory.centerY = centerY;
        console.log(`Saved blueprint ${type} - ${key} for ${roomName}`);
    }
    else {
        console.log(`Can't set blueprint for room ${roomName}`);
    }
}

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

global.findRouteCLI = function(room: string, target: string)
{
    let route = MapHelper.findRoute(room, target,  {
        ignoreSK: true,
        prioritizeHighways: true
    });

    if(route !== -2 && route.length) {
        let rooms = route.map((s) => s.room);
        console.log(`${room} to ${target} : ${rooms.length} rooms total:  ${JSON.stringify(rooms)}`)
    }
    else {
        console.log(`Failed to find a route for: ${room} => ${target}`);
    }
}
"use strict";
// League Of Automated Nations allied users list by Kamots
// Provides global.LOANlist as array of allied usernames. Array is empty if not in an alliance, but still defined.
// Updates on 2nd run and then every 1001 ticks or if the global scope gets cleared.
// Usage: After you require this file, just add this to anywhere in your main loop to run every tick: global.populateLOANlist();
// global.LOANlist will contain an array of usernames after global.populateLOANlist() runs twice in a row (two consecutive ticks).
// Memory.LOANalliance will contain the alliance short name after global.populateLOANlist() runs twice in a row (two consecutive ticks).
global.populateLOANlist = function(LOANuser: string = "LeagueOfAutomatedNations", LOANsegment: number = 99) {
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

global.formatNumber = (number: number) => new Intl.NumberFormat('de-DE').format(number);

global.resourceStats = function()
{
    let output = '<table><thead><tr><th>Room</th><th>   RCL</th><th>   Mineral</th><th>   Storage</th><th>   Terminal</th></tr><thead><tbody>';
    let mineralCount: any = {
        H:0, O:0, U:0, L:0, K:0, Z:0, X:0
    };
    for(let i in Game.rooms) {
        const room: Room = Game.rooms[i];
        if(room && room.controller && room.controller.my) {
            const mineral = room.find(FIND_MINERALS)[0];
            const storageSum = room.storage ? _.sum(room.storage.store) : 0;
            const terminalSum = room.terminal ? _.sum(room.terminal.store) : 0;
            const mineralInStorage = room.storage ? room.storage.store[mineral.mineralType] || 0 : 0;
            const mineralInTerminal = room.terminal ? room.terminal.store[mineral.mineralType] || 0 : 0;
            const energyInStorage = room.storage ? room.storage.store[RESOURCE_ENERGY] : 0;
            const energyInTerminal = room.terminal ? room.terminal.store[RESOURCE_ENERGY] : 0;

            output += '<tr onMouseOver="this.style.color=\'#0F0\'" onMouseOut="this.style.color=\'\'">';
            output += '<td><a href="#!/room/'+Game.shard.name+'/'+room.name+'">'+room.name+'</a></td>';
            output += '<td>   '+room.controller.level+'</td>';
            output += '<td>   '+mineral.mineralType.toUpperCase()+'</td>';
            output += '<td>   '+ (Math.floor(storageSum/1000).toString()+'k').padEnd(5,' ') +'|E:'+(Math.floor(energyInStorage / 1000).toString()+'k').padEnd(5,' ')+'|'+mineral.mineralType.toUpperCase()+':'+Math.floor(mineralInStorage/1000).toString()+'k</td>';
            output += '<td>   '+ (Math.floor(terminalSum/1000).toString()+'k').padEnd(5,' ') +'|E:'+(Math.floor(energyInTerminal / 1000).toString()+'k').padEnd(5,' ')+'|'+mineral.mineralType.toUpperCase()+':'+Math.floor(mineralInTerminal/1000).toString()+'k</td>';
            output += '</tr>';
            mineralCount[mineral.mineralType]++;
        }
    }
    output += '</tbody></table> \n';
    const missingMinerals = Object.keys(mineralCount).filter(e => mineralCount[e] === 0);
    if(missingMinerals && missingMinerals.length) {
        output += 'Missing '+missingMinerals.join(',')+' mineral room(s)';
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

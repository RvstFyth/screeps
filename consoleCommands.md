# Console commands

rollup -c --environment DEST:main


## Boosts
OS.kernel.addProcess('makeBoosts', {room: 'W56S33', boost: RESOURCE_GHODIUM, amount: 3000}, 0);
OS.kernel.addProcess('makeBoosts', {room: 'W15S2', boost: RESOURCE_UTRIUM_HYDRIDE,transporter:'88_19283181', shouldBoost: true, labs:['5b532f554df916370860b91d','5b53327c4df916370860ba62','5b5336334df916370860bbc1']}, 0);
global.OS.kernel.addProcess('emptyLabs', {room: 'W59S28'}, 0)
OS.kernel.addProcess('stockBoostsLab', {room: 'W54S31', boosts: [RESOURCE_CATALYZED_GHODIUM_ACID]}, 0);
OS.kernel.addProcess('autoMakeBoosts', {room: 'W56S33'}, 0);

OS.kernel.addProcess('stockBoostsLab', {room: 'W51S31', boosts: [RESOURCE_CATALYZED_ZYNTHIUM_ALKALIDE,RESOURCE_CATALYZED_GHODIUM_ALKALIDE,RESOURCE_CATALYZED_LEMERGIUM_ALKALIDE,RESOURCE_CATALYZED_ZYNTHIUM_ACID], transporter: '497_11258239'}, 0);

## Market & resource management
OS.kernel.addProcess('sellResources', {room: 'W56S33', resourceType: RESOURCE_HYDROGEN, amount: 14000}, 0);
global.OS.kernel.addProcess('haulResources', {room: 'W51S31', resource: RESOURCE_ENERGY, amount: 150000}, 0);

// W58S23
// SMokeman U room: W47S16
global.OS.kernel.addProcess('sendResources', {room: 'W56S33', target: 'W47S16', resource: RESOURCE_UTRIUM, amount: 75000}, 0)


global.OS.kernel.addProcess('sendResources', {room: 'W56S33', target: 'W55S17', resource: RESOURCE_HYDROGEN, amount: 85000}, 0)



_.forEach(Game.market.orders, (o) => !o.active ? Game.market.cancelOrder(o.id) : '');


OS.kernel.addProcess('remoteMining', {room: 'W56S33', target: 'W55S33', sourceID: '59bbc3dc2052a716c3ce6eb6'}, 0)

## Offensive
global.OS.kernel.addProcess('attackController', {room: 'W56S33', target: 'W59S36'}, 0)


global.OS.kernel.addProcess('lootRoom', {room: 'W56S33', target: "W59S36"}, 0)

OS.kernel.addProcess('claimRoom', {room: 'W13S1', target: 'W11S1'}, 0);


OS.kernel.addProcess('sourceKeeperAttacker', {room: 'W15S6', target: 'W15S5'}, 0)


OS.kernel.addProcess('harrasRemote', {room: 'W56S33', target: "W55S33"}, 0)

OS.kernel.addProcess('smallDrainer', {room: 'W51S32', target: "W47S31", creep: '3721_13920286'}, 0)



## Helmut
OS.kernel.addProcess('dismantleWall', {room: 'W51S31', target: 'W52S41', targetWall: '5bf15759f63611302e2e8a94'}, 0);
OS.kernel.addProcess('dismantleWall', {room: 'W51S31', target: 'W54S39', targetWall: '5bcbb0f04aed1f4c736d3420'}, 0);

_.forEach(Game.rooms['W55S23'].find(FIND_STRUCTURES), c => c.destroy())
_.forEach(Game.rooms['W55S23'].find(FIND_MY_CREEPS), c => c.suicide())

Room.Terrain.prototype.isSwamp(x, y){
	return !!(this.get(x, y) & TERRAIN_MASK_SWAMP);
}
Room.Terrain.prototype.isWall(x, y){
	return !!(this.get(x, y) & TERRAIN_MASK_WALL);
}

Room.Terrain.prototype.isPlain(x, y){
	return !(this.get(x, y) & (TERRAIN_MASK_SWAMP | TERRAIN_MASK_WALL));
}

global.DUAL_SOURCE_MINER_SIZE = (steps, cap = SOURCE_ENERGY_CAPACITY) => Math.ceil((cap * 2) / HARVEST_POWER / (ENERGY_REGEN_TIME - steps * 2));

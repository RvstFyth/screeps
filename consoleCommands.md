# Console commands

rollup -c --environment DEST:main


## Boosts
OS.kernel.addProcess('makeBoosts', {room: 'W56S33', boost: RESOURCE_GHODIUM, amount: 3000}, 0);
OS.kernel.addProcess('makeBoosts', {room: 'W15S2', boost: RESOURCE_UTRIUM_HYDRIDE,transporter:'88_19283181', shouldBoost: true, labs:['5b532f554df916370860b91d','5b53327c4df916370860ba62','5b5336334df916370860bbc1']}, 0);
global.OS.kernel.addProcess('emptyLabs', {room: 'W56S33'}, 0)
OS.kernel.addProcess('stockBoostsLab', {room: 'W51S31', boosts: [RESOURCE_CATALYZED_GHODIUM_ACID]}, 0);
OS.kernel.addProcess('autoMakeBoosts', {room: 'W56S33'}, 0);

OS.kernel.addProcess('stockBoostsLab', {room: 'W51S31', boosts: [RESOURCE_CATALYZED_ZYNTHIUM_ALKALIDE,RESOURCE_CATALYZED_GHODIUM_ALKALIDE,RESOURCE_CATALYZED_LEMERGIUM_ALKALIDE,RESOURCE_CATALYZED_ZYNTHIUM_ACID]}, 0);

## Market & resource management
OS.kernel.addProcess('sellResources', {room: 'W56S33', resourceType: RESOURCE_HYDROGEN, amount: 14000}, 0);
global.OS.kernel.addProcess('haulResources', {room: 'W51S31', resource: RESOURCE_ENERGY, amount: 100000}, 0);

global.OS.kernel.addProcess('sendResources', {room: 'W51S31', target: 'W53S32', resource: RESOURCE_CATALYZED_LEMERGIUM_ALKALIDE, amount: 5000}, 0)


OS.kernel.addProcess('remoteMining', {room: 'W3S0', target: 'W4S0', sourceID: '8b0607730ade1fb'}, 0)

## Offensive
global.OS.kernel.addProcess('attackController', {room: 'W59S21', target: 'W59S14'}, 0)


global.OS.kernel.addProcess('lootRoom', {room: 'W58S23', target: "W59S23"}, 0)

OS.kernel.addProcess('claimRoom', {room: 'W51S31', target: 'W51S37'}, 0);
OS.kernel.addProcess('sourceKeeperAttacker', {room: 'W15S6', target: 'W15S5'}, 0)


OS.kernel.addProcess('harrasRemote', {room: 'W51S31', target: "W58S38"}, 0)



## Helmut
OS.kernel.addProcess('dismantleWall', {room: 'W51S31', target: 'W52S41', targetWall: '5ba031de2791c246ccb252a5'}, 0);

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

# Console commands

rollup -c --environment DEST:main


## Boosts
utrium lemergite
OS.kernel.addProcess('makeBoosts', {room: 'W56S33', boost: RESOURCE_GHODIUM, amount: 3000}, 0);

OS.kernel.addProcess('makeBoosts', {room: 'W15S2', boost: RESOURCE_UTRIUM_HYDRIDE,transporter:'88_19283181', shouldBoost: true, labs:['5b532f554df916370860b91d','5b53327c4df916370860ba62','5b5336334df916370860bbc1']}, 0);

global.OS.kernel.addProcess('emptyLabs', {room: 'W56S33', creep: '495_11711662'}, 0)

OS.kernel.addProcess('stockBoostsLab', {room: 'W59S21', boosts: [RESOURCE_CATALYZED_GHODIUM_ACID]}, 0);
OS.kernel.addProcess('autoMakeBoosts', {room: 'W56S33'}, 0);

## Market & resource management
OS.kernel.addProcess('sellResources', {room: 'W56S33', resourceType: RESOURCE_HYDROGEN, amount: 14000}, 0);
global.OS.kernel.addProcess('haulResources', {room: 'W56S33', resource: RESOURCE_ENERGY, amount: 200000}, 0);
global.OS.kernel.addProcess('sendResources', {room: 'W56S29', target: 'W59S21', resource: RESOURCE_CATALYZED_GHODIUM_ACID, amount: 10000}, 0)

## Offensive
global.OS.kernel.addProcess('attackController', {room: 'W59S21', target: 'W59S14'}, 0)


global.OS.kernel.addProcess('lootRoom', {room: 'W51S32', target: "W52S31"}, 0)

OS.kernel.addProcess('claimRoom', {room: 'W6N1', target: 'W7N2'}, 0);

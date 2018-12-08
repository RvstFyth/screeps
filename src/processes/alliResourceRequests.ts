import {Process} from '../ROS/process'

export class AlliResourceRequests extends Process
{
    run() : void
    {
        const room: Room|undefined = Game.rooms[this.meta.room];
        if(room && room.terminal && room.storage) {
            const receivedTransactions: Transaction[] = Game.market.incomingTransactions.filter(
                (t: Transaction) => t.time === Game.time && global.LOANlist.indexOf(t.sender) > -1
            );
            if(receivedTransactions.length) {
                for(let i in receivedTransactions) {
                    const msgSplitted = receivedTransactions[i].description.split(' ');
                    if(msgSplitted.length === 2) {
                        const amount: number = parseInt(msgSplitted[0]);
                        const resource: ResourceConstant = msgSplitted[1] as ResourceConstant;
                        const txCosts: number = Game.market.calcTransactionCost(amount, room.name, receivedTransactions[i].from);
                        const canTransfer = room.storage.store[RESOURCE_ENERGY] && (room.storage.store[RESOURCE_ENERGY] - 30000) > txCosts;
                        const rInStorage: number|undefined = room.storage.store[resource];

                        if(canTransfer && rInStorage && rInStorage > amount * 2) {
                            if(!global.OS.kernel.hasProcessForNameAndMetaKeyValue('sendResources', 'target', receivedTransactions[i].from)) {
                                global.OS.kernel.addProcess('sendResources', {room: room.name, target: receivedTransactions[i].from, resource: resource, amount: amount}, 0);
                            }
                        }
                    }
                }
            }
        }
        else {
            this.state = 'killed';
        }
    }
}

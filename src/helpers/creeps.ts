export class CreepsHelper
{
    static getCreep(name: string) : Creep|undefined
    {
      return Game.creeps[name];
    }

    static healPower(creep: Creep) : number
    {
        let result: number = 0;
        for(let i in creep.body) {
            if(creep.body[i].type === HEAL) {
                if(creep.body[i].boost) {
                    switch(creep.body[i].boost) {
                        case RESOURCE_LEMERGIUM_OXIDE:
                            result += HEAL_POWER * 2;
                        break;
                        case RESOURCE_LEMERGIUM_ALKALIDE:
                            result += HEAL_POWER * 3;
                            break;
                        case RESOURCE_CATALYZED_LEMERGIUM_ALKALIDE:
                            result += HEAL_POWER * 4;
                            break;
                    }
                }
                else {
                  result += HEAL_POWER;
                }
            }
        }
        return result;
    }
}

import { MarketHelper } from "./Market";
import { RoomsHelper } from "./rooms";

export class BoostsHelper
{

    static boostForBodyPart(bodyPart: BodyPartConstant, tier: number) : MineralConstant|null
    {
        switch(bodyPart) {

        }

        return null;
    }

    // const boostTier = (r) => Math.ceil(r.length / 2);
    static defineTier(resource: ResourceConstant)
    {
        return Math.ceil(resource.length / 2);
    }

    static defineBoostToCreate(room: Room)
    {
        if(room.storage) {
            let minerals: {resource: string, amount: number}[] = [];
            for(let x in global.BOOST_COMPONENTS) {
                const tier = BoostsHelper.defineTier(x as ResourceConstant);
                const amount = room.storage.store[x as ResourceConstant] || 0;
                const max = tier === 3 ? 12000 : 3000;
                if(amount < max) {
                    minerals.push({
                        resource: x,
                        amount: room.storage.store[x as ResourceConstant] || 0
                    });
                }
            }

            let targetMineral;

            for(let i in minerals) {
                const ingredients: ResourceConstant[] = global.BOOST_COMPONENTS[minerals[i].resource];
                let fAmount = room.storage.store[ingredients[0]] || 0;
                let sAmount = room.storage.store[ingredients[1]] || 0;
                if(room.terminal) {
                    fAmount += room.terminal.store[ingredients[0]] || 0;
                    sAmount += room.terminal.store[ingredients[1]] || 0;
                }
                if(fAmount >= 3000 && sAmount >= 3000) {
                    targetMineral = minerals[i].resource;
                    break;
                }
                else {
                    try {
                        if(RoomsHelper.requestResources(room, (fAmount < 3000 ? ingredients[0] : ingredients[1]))) {

                        }
                        else {
                            const ingredient = (fAmount < 3000 ? ingredients[0] : ingredients[1]);
                            if(ingredient.length === 1 && room.terminal && !room.terminal.cooldown) {
                                const amountBought = MarketHelper.buyResources(room, ingredient);
                                if(amountBought > 0) break;
                            }
                        }
                    }
                    catch(e) {
                        console.log(`${e.message}`);
                    }
                }
            }
            if(targetMineral) {
                return targetMineral;
            }
        }

        return null;
    }
}

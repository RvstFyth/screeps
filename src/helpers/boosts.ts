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
}

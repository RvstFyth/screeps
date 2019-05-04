export class CombatHelper
{


    static towerDamageAtPos(tower: StructureTower, pos: RoomPosition)
    {
        const range = pos.getRangeTo(tower);
        if (range <= TOWER_OPTIMAL_RANGE) return TOWER_POWER_ATTACK;
        return TOWER_POWER_ATTACK * (1 - TOWER_FALLOFF * (Math.min(range, TOWER_FALLOFF_RANGE) - TOWER_OPTIMAL_RANGE) / (TOWER_FALLOFF_RANGE - TOWER_OPTIMAL_RANGE));
    }

    static towersDamageAtPos(room: Room, pos: RoomPosition)
    {
        if(!room.towers.length) return 0;
        let dmg = 0;
        for(let i = 0, iEnd = room.towers.length; i < iEnd; i++) {
            dmg += this.towerDamageAtPos(room.towers[i], pos);
        }
        return dmg;
    }

    static creepDismantleDamage(creep: Creep)
    {
        let res = 0;
        const bodyParts: BodyPartDefinition[] = creep.body;
        for(let p in bodyParts) {
            if(bodyParts[p].type === WORK) {
                res += DISMANTLE_POWER;
                const boost = bodyParts[p].boost;
                switch(boost) {
                    case RESOURCE_ZYNTHIUM_HYDRIDE:
                    case RESOURCE_ZYNTHIUM_ACID:
                    case RESOURCE_CATALYZED_ZYNTHIUM_ACID:
                        res += DISMANTLE_POWER * (1 + BOOSTS.work[boost].dismantle);
                        break;
                }
            }
        }
        return res;
    }
}

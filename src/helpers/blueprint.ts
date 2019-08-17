export class BlueprintsHelper {


    static getBluePrint(type: string, key: string) {
        if (BlueprintsHelper.blueprints[type] && BlueprintsHelper.blueprints[type][key]) {
            return BlueprintsHelper.blueprints[type][key];
        }
        console.log(`Blueprint ${type} - ${key} does not exist`);
        return undefined;
    }

    static getPositionsForConstructionSitesForRCL(structureType: BuildableStructureConstant, bType: string, bKey: string, rcl: number, centerX: number, centerY: number) {
        const blueprint = this.getBluePrint(bType, bKey);
        if (blueprint) {
            const tmp = blueprint[structureType];
            let positions: { x: number, y: number }[] = [];
            for (let i in tmp) {
                positions.push({
                    x: centerX + tmp[i].x,
                    y: centerY + tmp[i].y
                });
            }
            if (rcl < 8) return positions.slice(0, CONTROLLER_STRUCTURES[structureType][rcl]);
            return positions;
        }

        return [];
    }

    static getStructureTypesForBlueprint(type: string, key: string): string[] {
        const blueprint = this.getBluePrint(type, key);
        if (blueprint) {
            let tmp: string[] = [];
            for (let i in blueprint) {
                tmp.push(i);
            }
            return tmp;
        }
        return [];
    }

    static transporterSpots: any = {
        bunkers: {
            1: [
                // { x: 1, y: 1 },
                { x: 1, y: 3 },
                { x: 2, y: 2 }
            ]
        }
    }

    static storageLinkerSpots: any = {
        bunkers: {
            1: [
                {x: 1, y: 5}
            ]
        }
    }

    static labHandlerSpots: any = {
        bunkers: {
            1: [
                {x: -1, y: 3}
            ]
        }
    }

    static blueprints: any = {
        bunkers: {
            1: {
                [STRUCTURE_SPAWN]: [{ x: 2, y: 0 }, { x: 0, y: -2 }, { x: -2, y: 0 }],
                [STRUCTURE_TOWER]: [
                    { x: 1, y: -1 }, { x: -1, y: -1 }, { x: 0, y: 1 }, { x: 1, y: 0 }, { x: 0, y: -1 }, { x: -1, y: 0 }],
                [STRUCTURE_EXTENSION]: [
                    { x: 3, y: -1 }, { x: 2, y: -2 }, { x: 1, y: -3 }, { x: 3, y: -2 }, { x: 2, y: -3 },
                    { x: 0, y: -4 }, { x: -1, y: -3 }, { x: -2, y: -2 }, { x: -3, y: -1 }, { x: -3, y: -2 },
                    { x: -2, y: -3 }, { x: -2, y: -4 }, { x: 4, y: 0 }, { x: -4, y: 0 }, { x: -3, y: 1 },
                    { x: -1, y: 1 }, { x: 3, y: 1 }, { x: 4, y: -2 }, { x: 3, y: -3 }, { x: 2, y: -4 },
                    { x: -3, y: -3 }, { x: -4, y: -2 }, { x: 5, y: -3 }, { x: 4, y: -4 }, { x: 3, y: -5 },
                    { x: -3, y: -5 }, { x: -4, y: -4 }, { x: -5, y: -3 }, { x: 3, y: 2 }, { x: 3, y: 3 },
                    { x: 4, y: 2 }, { x: 3, y: 5 }, { x: 4, y: 4 }, { x: 5, y: 3 }, { x: 5, y: 1 },
                    { x: 5, y: 0 }, { x: 5, y: -1 }, { x: 5, y: -4 }, { x: 5, y: -5 }, { x: 4, y: -5 },
                    { x: 1, y: -5 }, { x: 0, y: -5 }, { x: -1, y: -5 }, { x: -4, y: -5 }, { x: -5, y: -5 },
                    { x: -5, y: -4 }, { x: -5, y: -1 }, { x: -5, y: 0 }, { x: -5, y: 1 }, { x: 4, y: 5 },
                    { x: 5, y: 4 }, { x: 5, y: 5 }, { x: -6, y: 2 }, { x: -6, y: -2 }, { x: -2, y: -6 },
                    { x: 2, y: 4 }, { x: 2, y: -6 }, { x: 6, y: -2 }, { x: 6, y: 2 }, { x: 2, y: 3 },],
                [STRUCTURE_STORAGE]: [{ x: 0, y: 4 }],
                [STRUCTURE_TERMINAL]: [{ x: -2, y: 2 }],
                [STRUCTURE_NUKER]: [{ x: 0, y: 6 }],
                [STRUCTURE_LINK]: [{ x: 0, y: 5 }],
                [STRUCTURE_POWER_SPAWN]: [{ x: 0, y: 2 }],
                [STRUCTURE_OBSERVER]: [{ x: -5, y: 5 }],
                [STRUCTURE_LAB]: [
                    { x: -2, y: 4 }, { x: -3, y: 3 }, { x: -4, y: 2 }, { x: -3, y: 5 }, { x: -4, y: 4 },
                    { x: -5, y: 3 }, { x: -2, y: 3 }, { x: -3, y: 2 }, { x: -4, y: 5 }, { x: -5, y: 4 }],
                [STRUCTURE_ROAD]: [
                    // diamond (n = 12)
                    { x: 3, y: 0 }, { x: 2, y: -1 }, { x: 1, y: -2 }, { x: 0, y: -3 }, { x: -1, y: -2 },
                    { x: -2, y: -1 }, { x: -3, y: 0 }, { x: -2, y: 1 }, { x: -1, y: 2 }, { x: 0, y: 3 },
                    { x: 1, y: 2 }, { x: 2, y: 1 },
                    // x-pattern (n = 24)
                    { x: 4, y: -1 }, { x: 5, y: -2 }, { x: 4, y: -3 },
                    { x: 3, y: -4 }, { x: 2, y: -5 }, { x: 1, y: -4 }, { x: -1, y: -4 }, { x: -2, y: -5 },
                    { x: -3, y: -4 }, { x: -4, y: -3 }, { x: -5, y: -2 }, { x: -4, y: -1 }, { x: -4, y: 1 },
                    { x: -5, y: 2 }, { x: -4, y: 3 }, { x: -3, y: 4 }, { x: -2, y: 5 }, { x: -1, y: 4 },
                    { x: 1, y: 4 }, { x: 2, y: 5 }, { x: 3, y: 4 }, { x: 4, y: 3 }, { x: 5, y: 2 },
                    { x: 4, y: 1 },
                    // outside (n = 33)
                    { x: 6, y: -3 }, { x: 6, y: -4 }, { x: 6, y: -5 }, { x: 5, y: -6 },
                    { x: 4, y: -6 }, { x: 3, y: -6 }, { x: 1, y: -6 }, { x: 0, y: -6 }, { x: -1, y: -6 },
                    { x: -3, y: -6 }, { x: -4, y: -6 }, { x: -5, y: -6 }, { x: -6, y: -5 }, { x: -6, y: -4 },
                    { x: -6, y: -3 }, { x: -6, y: -1 }, { x: -6, y: 0 }, { x: -6, y: 1 }, { x: -6, y: 3 },
                    { x: -6, y: 4 }, { x: -6, y: 5 }, { x: -5, y: 6 }, { x: -4, y: 6 }, { x: -3, y: 6 },
                    { x: 3, y: 6 }, { x: 4, y: 6 }, { x: 5, y: 6 }, { x: 6, y: 5 }, { x: 6, y: 4 },
                    { x: 6, y: 3 }, { x: 6, y: 1 }, { x: 6, y: 0 }, { x: 6, y: -1 },
                ],
                [STRUCTURE_RAMPART]: [
                    // top wall (n = 12)
                    { x: -5, y: -6 }, { x: -4, y: -6 }, { x: -3, y: -6 }, { x: -2, y: -6 }, { x: -1, y: -6 },
                    { x: 0, y: -6 }, { x: 1, y: -6 }, { x: 2, y: -6 }, { x: 3, y: -6 }, { x: 4, y: -6 },
                    { x: 5, y: -6 }, { x: 5, y: -5 },
                    // right wall (n = 12)
                    { x: 6, y: -5 }, { x: 6, y: -4 }, { x: 6, y: -3 }, { x: 6, y: -2 }, { x: 6, y: -1 },
                    { x: 6, y: 0 }, { x: 6, y: 1 }, { x: 6, y: 2 }, { x: 6, y: 3 }, { x: 6, y: 4 },
                    { x: 6, y: 5 }, { x: 5, y: 5 },
                    // bottom wall (n = 12)
                    { x: 5, y: 6 }, { x: 4, y: 6 }, { x: 3, y: 6 }, { x: 2, y: 6 }, { x: 1, y: 6 },
                    { x: 0, y: 6 }, { x: -1, y: 6 }, { x: -2, y: 6 }, { x: -3, y: 6 }, { x: -4, y: 6 },
                    { x: -5, y: 6 }, { x: -5, y: 5 },
                    // left wall (n = 12)
                    { x: -6, y: 5 }, { x: -6, y: 4 }, { x: -6, y: 3 }, { x: -6, y: 2 }, { x: -6, y: 1 },
                    { x: -6, y: 0 }, { x: -6, y: -1 }, { x: -6, y: -2 }, { x: -6, y: -3 }, { x: -6, y: -4 },
                    { x: -6, y: -5 }, { x: -5, y: -5 },
                    // storage (n = 1)
                    { x: 0, y: 4 },
                    // labs (n = 8)
                    { x: -4, y: 5 }, { x: -5, y: 4 }, { x: -5, y: 3 }, { x: -4, y: 4 }, { x: -3, y: 5 },
                    { x: -4, y: 2 }, { x: -3, y: 3 }, { x: -2, y: 4 },
                ]
            }
        }
    }
}

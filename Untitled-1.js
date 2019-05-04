CONTROLLER_STRUCTURES = {
  "spawn": {0: 0, 1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 6: 1, 7: 2, 8: 3},
  "extension": {0: 0, 1: 0, 2: 5, 3: 10, 4: 20, 5: 30, 6: 40, 7: 50, 8: 60},
  "link": {1: 0, 2: 0, 3: 0, 4: 0, 5: 2, 6: 3, 7: 4, 8: 6},
  "road": {0: 2500, 1: 2500, 2: 2500, 3: 2500, 4: 2500, 5: 2500, 6: 2500, 7: 2500, 8: 2500},
  "constructedWall": {1: 0, 2: 2500, 3: 2500, 4: 2500, 5: 2500, 6: 2500, 7: 2500, 8: 2500},
  "rampart": {1: 0, 2: 2500, 3: 2500, 4: 2500, 5: 2500, 6: 2500, 7: 2500, 8: 2500},
  "storage": {1: 0, 2: 0, 3: 0, 4: 1, 5: 1, 6: 1, 7: 1, 8: 1},
  "tower": {1: 0, 2: 0, 3: 1, 4: 1, 5: 2, 6: 2, 7: 3, 8: 6},
  "observer": {1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 1},
  "powerSpawn": {1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 1},
  "extractor": {1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 1, 7: 1, 8: 1},
  "terminal": {1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 1, 7: 1, 8: 1},
  "lab": {1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 3, 7: 6, 8: 10},
  "container": {0: 5, 1: 5, 2: 5, 3: 5, 4: 5, 5: 5, 6: 5, 7: 5, 8: 5},
  "nuker": {1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 1}
}
class BluePrints
{
    static get bluePrints()
    {
        if(!this._bluePrints) this._bluePrints = [];
        return this._bluePrints;
    }

    static getPositionsForStructure(room, structure, sortX, sortY, rcl)
    {
        if(!bluePrints[room][structure]) return [];
        const positions = bluePrints[room][structure].pos;
        if(sortX && sortY){
            for(let i = 0, iEnd = positions.length; i < iEnd; i++) {
                positions[i].distance = Math.max(Math.abs(sortX - positions[i].x), Math.abs(sortY - positions[i].y));
            }
            positions.sort((a,b) => a.distance - b.distance);
            if(rcl && rcl < 8) return positions.slice(0, CONTROLLER_STRUCTURES[structure][rcl]);
        }
        return positions;
    }

    static getStructuresForRCL(room, sortX, sortY, rcl)
    {
        const res = {};
        for(let n of Object.keys(CONTROLLER_STRUCTURES)) res[n] = getPositionsForStructure(room, n, sortX, sortY, rcl);
        return res;
    }
}

BluePrints.bluePrints.push({'W43S29':{"storage":{"pos":[{"x":12,"y":10}]},"extension":{"pos":[{"x":1,"y":6},{"x":2,"y":7},{"x":3,"y":6},{"x":5,"y":6},{"x":4,"y":7},{"x":3,"y":7},{"x":4,"y":8},{"x":5,"y":8},{"x":5,"y":9},{"x":5,"y":10},{"x":7,"y":10},{"x":9,"y":10},{"x":6,"y":9},{"x":8,"y":9},{"x":7,"y":8},{"x":9,"y":8},{"x":6,"y":7},{"x":8,"y":7},{"x":10,"y":7},{"x":12,"y":7},{"x":2,"y":5},{"x":1,"y":4},{"x":2,"y":3},{"x":1,"y":2},{"x":3,"y":4},{"x":4,"y":5},{"x":3,"y":2},{"x":4,"y":3},{"x":5,"y":2},{"x":6,"y":3},{"x":7,"y":2},{"x":8,"y":3},{"x":9,"y":2},{"x":10,"y":3},{"x":5,"y":4},{"x":7,"y":4},{"x":9,"y":4},{"x":11,"y":4},{"x":6,"y":5},{"x":7,"y":6},{"x":8,"y":5},{"x":10,"y":5},{"x":11,"y":6},{"x":9,"y":6},{"x":2,"y":1},{"x":3,"y":1},{"x":4,"y":1},{"x":5,"y":1},{"x":6,"y":1},{"x":7,"y":1},{"x":8,"y":1},{"x":9,"y":1},{"x":1,"y":3},{"x":12,"y":5},{"x":10,"y":2},{"x":6,"y":11},{"x":8,"y":11},{"x":10,"y":11},{"x":10,"y":9},{"x":11,"y":3}]},"spawn":{"pos":[{"x":13,"y":9},{"x":14,"y":10},{"x":10,"y":10}]},"terminal":{"pos":[{"x":12,"y":9}]},"link":{"pos":[{"x":14,"y":9}]},"powerSpawn":{"pos":[{"x":13,"y":11}]},"tower":{"pos":[{"x":14,"y":11},{"x":12,"y":11},{"x":7,"y":11},{"x":9,"y":11},{"x":18,"y":5},{"x":19,"y":6}]},"lab":{"pos":[{"x":16,"y":9},{"x":17,"y":10},{"x":18,"y":11},{"x":19,"y":12},{"x":19,"y":9},{"x":19,"y":10},{"x":18,"y":9},{"x":16,"y":11},{"x":16,"y":12},{"x":17,"y":12}]},"nuker":{"pos":[{"x":12,"y":6}]},"observer":{"pos":[{"x":12,"y":4}]},"rampart":{"pos":[{"x":20,"y":10},{"x":20,"y":11},{"x":20,"y":12},{"x":20,"y":13},{"x":19,"y":13},{"x":18,"y":13},{"x":17,"y":13},{"x":16,"y":13},{"x":15,"y":13},{"x":15,"y":12},{"x":14,"y":12},{"x":12,"y":12},{"x":13,"y":12},{"x":10,"y":12},{"x":11,"y":12},{"x":9,"y":12},{"x":7,"y":12},{"x":8,"y":12},{"x":6,"y":12}]}}});

console.log(BluePrints.getStructuresForRCL('W43S29',12 ,10,2))

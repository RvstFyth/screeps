Object.defineProperty(Room.prototype, 'sources', {
  get: function()
  {
    if(!this._sources) {
      if(!this.memory.sourceIDs) {
        this.memory.sourceIDs = this.find(FIND_SOURCES).map((s: Source) => s.id);
      }
      this._sources = this.memory.sourceIDs.map((id: string) => Game.getObjectById(id))
    }
    return this._sources;
  }
});

Object.defineProperty(Room.prototype, 'labs', {
  get: function()
  {
    if(!this._labs) {
      this._labs = this.find(FIND_STRUCTURES, {
        filter: (s: Structure) => s.structureType === STRUCTURE_LAB
      });
    }
    return this._labs;
  }
});

Object.defineProperty(Room.prototype, 'links', {
  get: function()
  {
    if(!this._links) {
      this._links = this.find(FIND_STRUCTURES, {
        filter: (s: Structure) => s.structureType === STRUCTURE_LINK
      });
    }
    return this._links;
  }
});

Object.defineProperty(Room.prototype, 'extractor', {
    get: function()
    {
      if(!this._extractor) {
        this._extractor = this.find(FIND_STRUCTURES, {
          filter: (s: Structure) => s.structureType === STRUCTURE_EXTRACTOR
        })[0];
      }

      return this._extractor;
    }
});

Object.defineProperty(Room.prototype, 'observer', {
    get: function()
    {
        if(!this._observer) {
            this._observer = this.find(FIND_STRUCTURES, {filter:(s:Structure) => s.structureType === STRUCTURE_OBSERVER})[0];
        }
        return this._observer;
    }
});

Object.defineProperty(Room.prototype, 'spawns', {
    get: function()
    {
      if(!this._spawns) {
        this._spawns = this.find(FIND_STRUCTURES, {
          filter: (s: Structure) => s.structureType === STRUCTURE_SPAWN
        });
      }
      return this._spawns;
    }
});

Object.defineProperty(Room.prototype, 'extensions', {
    get: function()
    {
      if(!this._extensions) {
        this._extensions = this.find(FIND_STRUCTURES, {
          filter: (s: Structure) => s.structureType === STRUCTURE_EXTENSION
        });
      }
      return this._extensions;
    }
});

Object.defineProperty(Room.prototype, 'towers', {
    get: function()
    {
      if(!this._towers) {
        this._towers = this.find(FIND_STRUCTURES, {
          filter: (s: Structure) => s.structureType === STRUCTURE_TOWER
        })
      }

      return this._towers;
    }
});

Object.defineProperty(Room.prototype, 'containers', {
    get: function() {
      if(!this._containers) {
        this._containers = this.find(FIND_STRUCTURES, {
          filter: (s: Structure) => s.structureType === STRUCTURE_CONTAINER
        })
      }

      return this._containers;
    }
});

Object.defineProperty(Room.prototype, 'walls', {
    get: function() {
      if(!this._walls) {
        this._walls = this.find(FIND_STRUCTURES, {
          filter: (s: Structure) => s.structureType === STRUCTURE_WALL
        })
      }

      return this._walls;
    }
});

Object.defineProperty(Room.prototype, 'roads', {
  get: function() {
    if(!this._roads) {
      this._roads = this.find(FIND_STRUCTURES, {
        filter: (s: Structure) => s.structureType === STRUCTURE_ROAD
      })
    }

    return this._roads;
  }
});

Object.defineProperty(Room.prototype, 'ramparts', {
    get: function() {
      if(!this._ramparts) {
        this._ramparts = this.find(FIND_STRUCTURES, {
          filter: (s: Structure) => s.structureType === STRUCTURE_RAMPART
        })
      }

      return this._ramparts;
    }
});

Object.defineProperty(Room.prototype, 'constructionSites', {
    get: function()
    {
      if(!this._constructionSites) {
        this._constructionSites = this.find(FIND_CONSTRUCTION_SITES);
      }
      return this._constructionSites;
    }
});

Object.defineProperty(Room.prototype, 'hostiles', {
  get: function()
  {
    if(!this._hostiles) {
      this._hostiles = this.find(FIND_HOSTILE_CREEPS, {
        filter: (c: Creep) => global.LOANlist.indexOf(c.owner.username) === -1 && c.owner.username !== 'BarryOSeven'
      });
    }

    return this._hostiles;
  }
});

Object.defineProperty(Room.prototype, 'invaders', {
  get: function()
  {
    if(!this._invaders) {
      this._invaders = this.hostiles.filter((h: Creep) => h.owner.username.toLowerCase() === 'invader');
    }

    return this._invaders;
  }
});

Object.defineProperty(Room.prototype, 'recycleContainers', {
  get: function()
  {
    if(!this._recycleContainers) {
      this._recycleContainers = [];
      let recContainers: string[] = [];
      for(let i in this.spawns as StructureSpawn) {
        const containers: StructureContainer[] = this.spawns[i].pos.findInRange(this.containers, 1);
        if(containers.length && recContainers.indexOf(containers[0].id) < 0) {
          recContainers.push(containers[0].id);
        }
      }
      if(recContainers.length) {
        this._recycleContainers = recContainers.map((id: string) => Game.getObjectById(id));
      }
    }

    return this._recycleContainers;
  }
});

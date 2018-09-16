Object.defineProperty(StructureSpawn.prototype, 'isSpawning', {
  get: function()
  {
    if(!this._spawning) {
      this._spawning = typeof this.spawning === 'object';
    }

    return this._spawning;
  },

  set: function(val: boolean)
  {
    this._spawning = val;
  }
})

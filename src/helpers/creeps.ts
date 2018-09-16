export class CreepsHelper
{
  static getCreep(name: string) : Creep|undefined
  {
    return Game.creeps[name];
  }
}

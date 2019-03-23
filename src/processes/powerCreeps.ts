import { Process } from "ROS/process";
import {N3RD } from "powercreeps/n3rd"

export class PowerCreeps extends Process
{


    public run()
    {
        if(Game.powerCreeps['N3RD'] && Game.powerCreeps['N3RD'].ticksToLive) {
            const CPU = Game.cpu.getUsed();
            N3RD.run(Game.powerCreeps['N3RD']);
            Memory.stats['cpu.N3RD.getUsed'] = Game.cpu.getUsed() - CPU;
        }
        else {
            const powerSpawn: StructurePowerSpawn|null = Game.getObjectById('XXX');
            if(powerSpawn) {
                Game.powerCreeps['N3RD'].spawn(powerSpawn);
            }
        }
    }
}

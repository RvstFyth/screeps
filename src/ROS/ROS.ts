import {Kernel} from "./kernel"

class ROS
{

  kernel: Kernel;

  constructor()
  {
    if(!Memory.ROS) {
      Memory.ROS = {};
    }
    if(!Memory.ROS.processes) {
      Memory.ROS.processes = [];
    }

    if(!Memory.spawnQueue) {
      Memory.spawnQueue = {};
    }

    this.kernel = new Kernel();
  }

  run()
  {
    this.kernel.run();
  }
}

export { ROS };

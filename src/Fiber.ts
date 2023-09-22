import { Effects, Fiber } from "./types";

function FiberNode(this: Fiber, tag) {
  // Instance
  this.tag = tag;
  this.key = null;
  

  this.$props = {};
  // Fiber
  this.parent = null;
  this.child = null;
  this.sibling = null;
  this.alternate = null;

  //Effects
  this.flag = Effects.NOFLAG;
}

export function createFiberNode() {
  return new FiberNode(22);
}

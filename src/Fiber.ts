import { Effects, ElementType, Fiber, Props, VDOM, WithNone } from "./types";
const REACT_ELEMENT_TYPE = Symbol.for("MReact");

function FiberNode(this: Fiber) {
  // Instance
  this.type = ElementType.NONE;
  this.key = null;
  this.vDom = null;
  this.dom = null;

  this.props = {};
  // Fiber
  this.parent = null;
  this.child = null;
  this.sibling = null;
  this.alternate = null;

  //Effects
  this.flag = Effects.NOFLAG;
}

export function createFiberNode(type?: ElementType): Fiber {
  const res: Fiber = new FiberNode();
  type && (res.type = type);
  return res;
}


export function MReactElement(
  type: ElementType,
  key: WithNone<string>,
  ref: any,
  props: Props,
  $props: Props,
  children: Array<VDOM>
): VDOM {
  const vDOM: VDOM = {
    $$typeof: REACT_ELEMENT_TYPE,
    $props,
    type,
    key,
    ref,
    props,
    children,
  };
  return vDOM;
}
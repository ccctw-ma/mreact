export enum ElementType {
  NONE = "NONE",
  TEXT_ELEMENT = "TEXT_ELEMENT",
  FUNCTION_ELEMENT = "FUNCTION_ELEMENT",
  ELEMENT = "ELEMENT",
}

export enum Effects {
  NOFLAG = "NOFLAG",
  UPDATE = "UPDATE",
  PLACEMENT = "PLACEMENT",
  DELETION = "DELETION",
}

export type WithNone<T> = T | null | undefined;

export type HTMLTags = keyof HTMLElementTagNameMap;

export interface Props {
  [x: string]: any;
}

export interface VDOM {
  $$typeof: symbol;
  $props: Props; // 针对不同情况放置一些字段
  type: ElementType; // 是什么类型的节点
  key: WithNone<string>; // 唯一的标识符
  ref: any;
  props: Props; // 这些是可以直接挂载到 dom 上的属性
  children: Array<VDOM>;
}

export interface Fiber {
  // Instance
  type: ElementType;
  key: any;
  vDom: WithNone<VDOM>;
  dom: WithNone<Node>;
  props: Props; // 对应的就是挂载到dom上的属性

  // Fiber
  child: WithNone<Fiber>;
  parent: WithNone<Fiber>;
  sibling: WithNone<Fiber>;
  alternate: WithNone<Fiber>;

  // Effects
  flag: Effects;
  memoizedHook: any; // 记录挂载到该 Fiber 的 hook 链表头

  // other
  [x: string]: any;
}

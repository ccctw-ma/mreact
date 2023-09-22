export enum ElementType {
  TEXT_ELEMENT = "TEXT_ELEMENT",
  FUNCTION_ELEMENT = "FUNCTION_ELEMENT",
  ELEMENT = "ELEMENT",
}

export enum WorkTag {
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

export type HTMLTags = keyof HTMLElementTagNameMap;

export interface Props {
  [x: string]: any;
}



export interface VDOM {
  $$typeof: symbol;
  $props: Props, // 针对不对情况放置一些字段
  type: ElementType;
  key: WithNone<string>;
  ref: any;
  props: Props; // 这些是可以直接挂载到 dom 上的属性
}

export interface Fiber {
  type: ElementType;
  tag?: HTMLTags;
  dom: WithNone<Node>;
  child: WithNone<Fiber>;
  parent: WithNone<Fiber>;
  sibling: WithNone<Fiber>;
  alternate: WithNone<Fiber>;
  props: Props;
  children: Array<VDOM>;
  [x: string]: any;
}

export type WithNone<T> = T | null | undefined;

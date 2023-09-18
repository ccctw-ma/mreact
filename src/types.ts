export enum ElementType {
  TEXT_ELEMENT,
  FUNCTION_ELEMENT,
  ELEMENT,
}

export interface ODOM {
  type: HTMLTags | ElementType.TEXT_ELEMENT;
  props: Props;
}

export type VDOM = ODOM | string | number;

export type HTMLTags = keyof HTMLElementTagNameMap;

export interface Props {
  children: Array<VDOM>;
  [x: string]: any;
}

export type Children = Array<VDOM>;

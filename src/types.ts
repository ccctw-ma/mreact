export enum ElementType {
  TEXT_ELEMENT,
  FUNCTION_ELEMENT,
  ELEMENT,
}

export type HTMLTags = keyof HTMLElementTagNameMap;

export interface Props {
  children: Array<VDOM>;
  [x: string]: any;
}
export interface VDOM {
  type: ElementType;
  tag: HTMLTags;
  props: Props;
}

import { ElementType, HTMLTags, VDOM } from "./types";

export function createElement(
  tag: HTMLTags,
  props: Object | null,
  ...children: Array<VDOM | number | string>
): VDOM {
  return {
    type: ElementType.ELEMENT,
    tag,
    props: {
      ...props,
      children: children.map((child) => {
        return typeof child === "object"
          ? child
          : createTextElement(child.toString());
      }),
    },
  };
}

function createTextElement(text: string): VDOM {
  return {
    type: ElementType.TEXT_ELEMENT,
    tag: "p",
    props: {
      nodeValue: text,
      children: [],
    },
  };
}

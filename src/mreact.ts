import { Children, ElementType, HTMLTags, VDOM } from "./types";

export function createElement(
  type: HTMLTags,
  props: Object | null,
  ...children: Children
): VDOM {
  return {
    type,
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
    props: {
      nodeValue: text,
      children: [],
    },
  };
}

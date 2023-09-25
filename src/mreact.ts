import { MReactElement } from "./Fiber";
import { ElementType, HTMLTags, VDOM } from "./types";
import { isFunctionComponent } from "./utils";


export function createElement(
  tag: HTMLTags | Function,
  props: Object | null,
  ...children: Array<VDOM | string>
): VDOM {
  let key = null,
    ref = null;

  if (isFunctionComponent(tag)) {
    return MReactElement(
      ElementType.FUNCTION_ELEMENT,
      key,
      ref,
      {
        ...props,
      },
      {
        fn: tag,
      },
      children.map((child) => {
        return typeof child === "object" ? child : createTextElement(child);
      })
    );
  } else {
    return MReactElement(
      ElementType.ELEMENT,
      key,
      ref,
      {
        ...props,
      },
      {
        tag,
      },
      children.map((child) => {
        return typeof child === "object" ? child : createTextElement(child);
      })
    );
  }
}

function createTextElement(text: string): VDOM {
  return MReactElement(
    ElementType.TEXT_ELEMENT,
    null,
    null,
    { nodeValue: text },
    {},
    []
  );
}



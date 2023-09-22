import { ElementType, HTMLTags, Props, VDOM, WithNone } from "./types";
import { isFunctionComponent } from "./utils";

const REACT_ELEMENT_TYPE = Symbol.for("MReact");

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
        children: children.map((child) => {
          return typeof child === "object" ? child : createTextElement(child);
        }),
      },
      {
        fn: tag,
      }
    );
  } else {
    return MReactElement(
      ElementType.ELEMENT,
      key,
      ref,
      {
        ...props,
        children: children.map((child) => {
          return typeof child === "object" ? child : createTextElement(child);
        }),
      },
      {
        tag,
      }
    );
  }
}

function createTextElement(text: string): VDOM {
  return MReactElement(
    ElementType.TEXT_ELEMENT,
    null,
    null,
    { nodeValue: text, children: [] },
    {}
  );
}

function MReactElement(
  type: ElementType,
  key: WithNone<string>,
  ref: any,
  props: Props,
  $props: Props
): VDOM {
  const vDOM: VDOM = {
    $$typeof: REACT_ELEMENT_TYPE,
    $props,
    type,
    key,
    ref,
    props,
  };
  return vDOM;
}

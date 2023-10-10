import { Fiber, ElementType, Props } from "./types";

const isEvent = (key: string) => key.startsWith("on");

export const isProperty = (key: string) => key !== "children";

export const isNew = (pre: Props, cur: Props) => (key: string) =>
  pre[key] != cur[key];

export const isGone = (_pre: Props, cur: Props) => (key: string) =>
  !(key in cur);

export const isFunctionComponent = (x: any) => typeof x === "function";

export function createDom(fiber: Fiber) {
  const dom =
    fiber.type === ElementType.TEXT_ELEMENT
      ? document.createTextNode("")
      : document.createElement(fiber.tag!);

  updateDom(dom, {}, fiber.props);

  return dom;
}

export function updateDom(dom: Node, prevProps: Props, nextProps: Props) {
  //Remove old or changed event listeners
  Object.keys(prevProps)
    .filter(isEvent)
    .filter((key) => !(key in nextProps) || isNew(prevProps, nextProps)(key))
    .forEach((name) => {
      const eventType = name.toLowerCase().substring(2);
      dom.removeEventListener(eventType, prevProps[name]);
    });

  // Remove old properties
  Object.keys(prevProps)
    .filter(isProperty)
    .filter(isGone(prevProps, nextProps))
    .forEach((name) => {
      dom[name] = "";
    });

  // Set new or changed properties
  Object.keys(nextProps)
    .filter(isProperty)
    .filter(isNew(prevProps, nextProps))
    .forEach((name) => {
      dom[name] = nextProps[name];
    });

  // Add event listeners
  Object.keys(nextProps)
    .filter(isEvent)
    .filter(isNew(prevProps, nextProps))
    .forEach((name) => {
      const eventType = name.toLowerCase().substring(2);
      dom.addEventListener(eventType, nextProps[name]);
    });
}

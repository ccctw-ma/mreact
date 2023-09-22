import { Fiber, ElementType, Props } from "./types";

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

  Object.keys(fiber.props)
    .filter(isProperty)
    .forEach((key) => {
      dom[key] = fiber.props[key];
    });

  return dom;
}

export function updateDom(dom: Node, preProps: Props, curProps: Props) {
  // remove old properties
  Object.keys(preProps)
    .filter(isProperty)
    .filter(isGone(preProps, curProps))
    .forEach((key) => {
      dom[key] = "";
    });
  // set new or changed properties
  Object.keys(curProps)
    .filter(isProperty)
    .filter(isNew(preProps, curProps))
    .forEach((key) => {
      dom[key] = curProps[key];
    });
}

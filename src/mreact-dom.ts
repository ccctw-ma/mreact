import { ElementType, VDOM } from "./types";
import { isProperty } from "./utils";

export function render(element: VDOM, container: HTMLElement) {
  if (!container) {
    throw new Error("container can't be null");
  }
  const dom =
    element.type === ElementType.TEXT_ELEMENT
      ? document.createTextNode("")
      : document.createElement(element.tag);

  Object.keys(element.props)
    .filter(isProperty)
    .forEach((key) => {
      dom[key] = element.props[key];
    });
  if (!(dom instanceof Text)) {
    element.props.children.forEach((child) => {
      render(child, dom);
    });
  }

  container.appendChild(dom);
}

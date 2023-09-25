import { MReactElement, createFiberNode } from "./Fiber";
import { Effects, ElementType, Fiber, VDOM, WithNone } from "./types";
import { createDom, isProperty, updateDom } from "./utils";

let nextUnitWork: WithNone<Fiber> = null;
let preRoot: WithNone<Fiber> = null; // last fiber tree wo commited to the DOM
let root: WithNone<Fiber> = null; // root of fiber tree
let deletions: Array<Fiber> = [];

function workLoop(deadline: IdleDeadline) {
  let shouldYield = false;
  while (nextUnitWork && !shouldYield) {
    nextUnitWork = performUnitOfWork(nextUnitWork);
    shouldYield = deadline.timeRemaining() < 1;
  }

  if (!nextUnitWork && root) {
    console.log(root);
    commitRoot();
  }
  requestIdleCallback(workLoop);
}

function commitRoot() {
  deletions.forEach(commitWork);
  commitWork(root?.child);
  preRoot = root;
  root = null;
}

function commitWork(fiber: WithNone<Fiber>) {
  if (!fiber) return;
  let domParentFiber: WithNone<Fiber> = fiber.parent;
  while (!domParentFiber?.dom) {
    domParentFiber = domParentFiber?.parent;
  }
  const domParent = domParentFiber.dom;
  if (fiber.flag === Effects.PLACEMENT && fiber.dom != null) {
    domParent?.appendChild(fiber.dom);
  } else if (fiber.flag === Effects.DELETION) {
    commitDeletion(fiber, domParent);
  } else if (fiber.flag === Effects.UPDATE && fiber.dom != null) {
    updateDom(fiber.dom, fiber.alternate!.props, fiber.props);
  }
  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

function commitDeletion(fiber: Fiber, domParent: WithNone<Node>) {
  if (fiber.dom) {
    domParent?.removeChild(fiber.dom);
  } else {
    commitDeletion(fiber.child!, domParent);
  }
}

function performUnitOfWork(fiber: Fiber) {
  const isFunctionComponent = fiber.type === ElementType.FUNCTION_ELEMENT;
  if (isFunctionComponent) {
    updateFunctionComponent(fiber);
  } else {
    updateHostComponent(fiber);
  }

  if (fiber.child) {
    return fiber.child;
  }
  let nextFiber: WithNone<Fiber> = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }
    nextFiber = nextFiber.parent;
  }
}

function updateFunctionComponent(fiber: Fiber) {
  const children = [fiber.vDom?.$props.fn(fiber.props)];
  reconcileChildren(fiber, children);
}

function updateHostComponent(fiber: Fiber) {
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }
  const elements = fiber.vDom!.children;
  reconcileChildren(fiber, elements);
}

function reconcileChildren(fiber: Fiber, elements: Array<VDOM>) {
  let index = 0;
  let oldFiber = fiber.alternate && fiber.alternate.child;
  let prevSibling: WithNone<Fiber> = null;
  while (index < elements.length || oldFiber != null) {
    const element = elements[index];
    let newFiber = createFiberNode();
    const sameType =
      oldFiber && element && element.props.tag === oldFiber.props.tag;

    if (sameType) {
      newFiber.type = oldFiber!.type;
      newFiber.key = oldFiber!.key;
      newFiber.dom = oldFiber!.dom;
      newFiber.parent = oldFiber!.parent;
      newFiber.props = element.props;
      newFiber.vDom = element;
      newFiber.flag = Effects.UPDATE;
    }

    if (element && !sameType) {
      newFiber.type = element.type;
      newFiber.key = element.key;
      newFiber.props = element.props;
      newFiber.parent = fiber;
      newFiber.vDom = element;
      newFiber.flag = Effects.PLACEMENT;

      newFiber.tag = element.$props.tag;
    }

    if (oldFiber && !sameType) {
      oldFiber.flag = Effects.DELETION;
      deletions.push(oldFiber);
    }

    if (oldFiber) {
      oldFiber = oldFiber.sibling;
    }

    if (index === 0) {
      fiber.child = newFiber;
    } else {
      prevSibling!.sibling = newFiber;
    }
    prevSibling = newFiber;
    index++;
  }
}

export function render(element: VDOM, container: HTMLElement) {
  if (!container) {
    throw new Error("container can't be null");
  }

  requestIdleCallback(workLoop);

  root = createFiberNode(ElementType.ELEMENT);
  root.vDom = MReactElement(ElementType.ELEMENT, null, null, {}, {}, [element]);
  root.dom = container;
  root.alternate = preRoot;

  deletions = [];
  nextUnitWork = root;
}

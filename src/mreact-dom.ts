import { MReactElement, createFiberNode } from "./Fiber";
import { Effects, ElementType, Fiber, VDOM, WithNone } from "./types";
import { createDom, isProperty, updateDom } from "./utils";

let nextUnitWork: WithNone<Fiber> = null; // work unit
let preRoot: WithNone<Fiber> = null; // last fiber tree wo commited to the DOM
let root: WithNone<Fiber> = null; // root of fiber tree
let deletions: Array<Fiber> = [];
let workFiber: WithNone<Fiber> = null; // current working fiber
let workInProgressHook: any = null;

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
  fiber.isMounted = true;
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
  workFiber = fiber;
  const children = [fiber.vDom?.$props.fn(fiber.props)];
  reconcileChildren(fiber, children);
}

export function useState(init: any) {
  let state = typeof init === "function" ? init() : init;
  let hook: any;
  // 如果有 alternate 那么证明就不是初始化的
  // 反之就是需要初始化的了
  if (workFiber!.isMounted) {
    hook = workInProgressHook;
    let baseState = hook.memoizedState;
    if (hook.queue.pending) {
      let fisrtAction = hook.queue.pending.next;
      do {
        baseState =
          typeof fisrtAction.action === "function"
            ? fisrtAction.action(baseState)
            : fisrtAction.action;
        fisrtAction = fisrtAction.next;
      } while (fisrtAction !== hook.queue.pending);
      hook.memoizedState = baseState;
      hook.queue.pending = null;
    }
  } else {
    hook = {
      type: "useState",
      memoizedState: state,
      next: null,
      queue: {
        pending: null, // 这个始终指向 queue 的最后一个 update 对象
      },
    };
    if (!workFiber?.memoizedHook) {
      workFiber!.memoizedHook = workInProgressHook = hook;
    }
    workInProgressHook = workInProgressHook.next = hook;
  }
  return [hook.memoizedState, dispatchAction.bind(null, workFiber, hook)];
}

function dispatchAction(currentRenderingFiber, hook, action) {
  // 更新操作
  let update: any = {
    action,
    next: null,
  };
  // queue.pending = u0 ---> u0
  //                 ^       |
  //                 |       |
  //                 ---------
  // queue.pending = u1 ---> u0
  //                 ^       |
  //                 |       |
  //                 ---------
  // queue.pending = u2 ---> u0
  //                 ^       |
  //                 |       |
  //                 -- u1 <--
  // 之所以这样操作是因为， 这样可以在O(1) 的时间完成队尾的更新操作的插入
  // 并且可以使用 O(1) 的时间获取到队首，妙呀!!!
  if (!hook.queue.pending) {
    // 第一次使用setXXX， 形成一个环形闭环
    update.next = update;
  } else {
    update.next = hook.queue.pending.next;
    hook.queue.pending.next = update;
  }
  // queue.pending.next 永远指向第一插入的update节点
  hook.queue.pending = update;

  // todo 开始调度更新
  root = currentRenderingFiber;
  root!.alternate = currentRenderingFiber;
  nextUnitWork = root;
}

function updateHostComponent(fiber: Fiber) {
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }
  const elements = fiber.vDom!.children;
  reconcileChildren(fiber, elements);
}

//todo: 这里的算法需要优化一下
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
      newFiber.alternate = oldFiber;
      newFiber.props = element.props;
      newFiber.vDom = element;
      newFiber.flag = Effects.UPDATE;
    }

    if (element && !sameType) {
      newFiber.type = element.type;
      newFiber.key = element.key;
      newFiber.props = element.props;
      newFiber.parent = fiber;
      newFiber.alternate = null;
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

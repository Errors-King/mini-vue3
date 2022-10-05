import { createVNode, Fragment } from "../createVNode";

// 渲染插槽
export function renderSlots(slots, name, props) {
  const slot = slots[name]
  if (slot) {

    if (typeof slot === 'function') {
      return createVNode(Fragment, {}, slot(props))
    }
  }
}
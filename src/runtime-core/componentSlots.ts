import { ShapeFlags } from "../utils/shapeFlags"

export function initSlots (instance, children) {
  // instance.slots = Array.isArray(children) ? children : [children]
  const { vnode } = instance
  if (vnode.shapeFlag & ShapeFlags.SLOT_CHILDREN) {
    normalizeObjectSlots(children, instance.slots)
  }
}

function normalizeObjectSlots (children, slots) {
  for (let key in children) {
    let value = children[key]

    slots[key] = (props) => normalizeSlotValue(value(props))
  }
}

function normalizeSlotValue(value) {
  return Array.isArray(value) ? value : [value]
}
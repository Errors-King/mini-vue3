import { mutableHandlers, readonlyHandlers, shallowReadonlyHandlers } from "./baseHandlers"

export const enum ReactiveFlags {
  IS_REACTIVE = '_v_isReactive',
  IS_READONLY = '_v_isRaedonly'
}

export function reactive(raw) {
  return new Proxy(raw, mutableHandlers)
}

export function readonly(raw) {
  return new Proxy(raw, readonlyHandlers)
}

export function shallowReadonly (raw) {
  return new Proxy(raw, shallowReadonlyHandlers)
}

export function isReactive(value) {
  return !!value[ReactiveFlags.IS_REACTIVE]
}

export function isReadonly(value) {
  return !!value[ReactiveFlags.IS_READONLY]
}

export function isProxy (value) {
  return isReactive(value) || isReadonly(value)
}
import { mutableHandlers, readonlyHandlers } from "./baseHandlers"

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

export function isReactive(value) {
  return !!value[ReactiveFlags.IS_REACTIVE]
}

export function isReadonly(value) {
  return !!value[ReactiveFlags.IS_READONLY]
}
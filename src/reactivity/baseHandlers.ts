import { track, trigger } from "./effect"
import { ReactiveFlags } from './reactive'



// 创建 getter ，普通的 getter 和 readonly 的 getter
function createGetter(isReadonly = false) {
  return function (target, key) {
    const res = Reflect.get(target, key)
    // 触发 getter 时能够知道这个是一个 readonly 还是一个 observer
    if (key === ReactiveFlags.IS_REACTIVE) {
      return !isReadonly
    } else if (key === ReactiveFlags.IS_READONLY) {
      return isReadonly
    }
    if (!isReadonly) {
      // 不是 readonly 就需要收集依赖
      track(target, key)
    }
    return res
  }
}

// 创建 setter
function createSetter() {
  return function (target, key, value) {
    const res = Reflect.set(target, key, value)

    trigger(target, key)
    return res
  }
}

const set = createSetter()
const get = createGetter()
const readonlyGet = createGetter(true)

// 可变的 handler
export const mutableHandlers = {
  get,
  set
}

// readonly 的 handler
export const readonlyHandlers = {
  get: readonlyGet,
  set(target, key, value) {
    console.warn('raadonly 是不允许 set 的')
    return true
  }
}
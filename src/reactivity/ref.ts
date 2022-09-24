import { hasChanged, isObject } from "../utils";
import { isTracking, trackEffects, triggerEffects } from "./effect";
import { reactive } from "./reactive";

class RefImpl {
  private _value: any;
  public dep;
  public rawValue: any;
  _v_isRef = true
  constructor (value) {
    // 保存没转换之前的 value
    this.rawValue = value
    // 处理 ref 是对象的情况
    this._value = convert(value)
    this.dep = new Set()
  }

  get value () {
    // 当需要收集依赖的时候才会 触发 track
    trackRefValue(this)
    return this._value
  }

  set value (newValue) {
    if (!hasChanged(this.rawValue, newValue)) return
    this.rawValue = newValue
    this._value = convert(newValue)
    triggerEffects(this.dep)
  }
}

export function ref (value) {
  return new RefImpl(value)
}

// ref 收集依赖
function trackRefValue (ref) {
  if (isTracking()) {
    trackEffects(ref.dep)
  }
}

// 判断 value 是否是对象，是就需要用 reactive 包裹
function convert (value) {
  return isObject(value) ? reactive(value) : value
}

export function isRef (ref) {
  return !!ref._v_isRef
}

export function unRef (ref) {
  return isRef(ref) ? ref.value : ref
}

export function proxyRefs (objectWithRefs) {
  return new Proxy(objectWithRefs, {
    get(target, key) {
      return unRef(Reflect.get(target, key))
    },
    set(target, key, value) {
      // 如果当前 target[key] 是一个 ref ，而 value 不是的话
      // 需要将 target[key].value 赋值为 value，其他情况直接替换
      if (isRef(target[key]) && !isRef(value)) {
        return target[key].value = value
      } else {
        return Reflect.set(target, key, value)
      }
    }
  })
}
export function isObject (value) {
  return typeof value === 'object'
}

export function hasChanged (val, newValue) {
  return !Object.is(val, newValue)
}

export function isOn (key) {
  return /^on[A-Z]/.test(key)
}

export function hasOwn (target, key) {
  return Object.prototype.hasOwnProperty.call(target, key)
}

// 处理肉串形式 emit-add
export const camelize = (str: string) => {
  return str.replace(/-(\w)/g, (_, c) => {
    return c ? c.toUpperCase() : ''
  })
}

const capitalize = (word: string) => word.slice(0, 1).toUpperCase() + word.slice(1)

export const toHandlerkey = (event) => event ? 'on' + capitalize(event) : ''
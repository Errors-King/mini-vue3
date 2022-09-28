export function isObject (value) {
  return typeof value === 'object'
}

export function hasChanged (val, newValue) {
  return !Object.is(val, newValue)
}

export function isOn (key) {
  return /^on[A-Z]/.test(key)
}
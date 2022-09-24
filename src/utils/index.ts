export function isObject (value) {
  return typeof value === 'object'
}

export function hasChanged (val, newValue) {
  return !Object.is(val, newValue)
}
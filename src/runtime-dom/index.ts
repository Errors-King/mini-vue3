import { createRenderer } from '../runtime-core'
import { isOn } from '../utils'


function createElement(type) {

  return document.createElement(type)

}

function patchProp(el, key, preVal, nextVal) {
  if (isOn(key)) {
    const event = key.slice(2).toLowerCase()
    el.addEventListener(event, nextVal)
  } else {
    // 当新的值是 null | undefined, 就删除
    if (nextVal == null) {
      el.removeAttribute(key)
    } else {
      el.setAttribute(key, nextVal)
    }
   
  }
}

function insert(el, container) {
  container.append(el)
}

const renderer: any = createRenderer({
  createElement,
  patchProp,
  insert
})

export function createApp(...args) {
  return renderer.createApp(...args)
}

export * from '../runtime-core'
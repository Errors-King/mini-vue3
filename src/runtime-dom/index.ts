import { createRenderer } from '../runtime-core'
import { isOn } from '../utils'


function createElement(type) {

  return document.createElement(type)

}


// 设置 props
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

// 插入元素
function insert(el, container) {
  container.append(el)
}

// 移除元素
function remove (child) {
  // 获取要删除元素的父级
  const parent = child.parentNode
  if (parent) {
    parent.removeChild(child)
  }
}

// 设置文本元素
function setElementText (container, text) {
  container.textContent = text
}

const renderer: any = createRenderer({
  createElement,
  patchProp,
  insert,
  remove,
  setElementText
})

export function createApp(...args) {
  return renderer.createApp(...args)
}

export * from '../runtime-core'
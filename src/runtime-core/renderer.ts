
import { isOn } from "../utils/index"
import { ShapeFlags } from "../utils/shapeFlags"
import { createComponentInstance, setupComponent } from "./component"
import { Fragment, Text } from "./createVNode"

export function render(vnode, container) {
  // 执行patch
  patch(vnode, container, null)
}

function patch(vnode, container, parentComponent) {
  // 判断 vnode 时 component 还是 element，并执行对应的处理逻辑

  // shapeFlags
  const { shapeFlag, type } = vnode
  switch (type) {
    case Fragment:
      processFragment(vnode, container, parentComponent)
      break;
    case Text:
      processText(vnode, container)
      break;
    default:
      if (shapeFlag & ShapeFlags.ELEMENT) {
        processElement(vnode, container, parentComponent)
      } else if (shapeFlag & ShapeFlags.STATEFUL_COMPOMENT) {
        processComponent(vnode, container, parentComponent)
      }
      break;
  }


}

// 处理 component
function processComponent(vnode, container, parentComponent) {
  mountComponent(vnode, container, parentComponent)
}

function processElement(vnode, container, parentComponent) {
  mountElement(vnode, container, parentComponent)
}

function processFragment(vnode: any, container: any, parentComponent) {
  mountChildren(vnode.children, container, parentComponent)
}

function processText(vnode, container) {
  const { children }  = vnode
  const textNode = vnode.el = document.createTextNode(children)
  container.append(textNode)
}


// 挂载组件
function mountComponent(initialVnode, container, parentComponent) {
  // 创建实例
  const instance = createComponentInstance(initialVnode, parentComponent) // {vnode: vnode, type: vnode.type}
  setupComponent(instance)
  setupRenderEffect(instance, initialVnode, container)
}

function mountElement(vnode, container, parentComponent) {
  const el = vnode.el = document.createElement(vnode.type)

  const { children } = vnode

  // 判断 childre 是否是数组
  if (typeof children === 'string') {
    el.textContent = vnode.children
  } else if (Array.isArray(children)) {
    // children.forEach(v => patch(v, el))
    mountChildren(children, el, parentComponent)
  }

  const { props } = vnode
  for (let key in props) {
    const value = props[key]

    // 判断是否是需要注册事件
    if (isOn(key)) {
      const event = key.slice(2).toLowerCase()
      el.addEventListener(event, value)
    } else {
      el.setAttribute(key, value)
    }

  }

  container.append(el)
}

function mountChildren(children, container, parentComponent) {
  children.forEach(v => patch(v, container, parentComponent))
}



function setupRenderEffect(instance, initialVnode, container) {
  // rend 的时候绑定代理对象
  const { proxy } = instance

  const subTree = instance.render.call(proxy)

  patch(subTree, container, instance)

  initialVnode.el = subTree.el
}



import { isObject } from "../utils/index"
import { ShapeFlags } from "../utils/shapeFlags"
import { createComponentInstance, setupComponent } from "./component"

export function render (vnode, container) {
  // 执行patch
  patch(vnode, container)
}

function patch (vnode, container) {
  // 判断 vnode 时 component 还是 element，并执行对应的处理逻辑

  // shapeFlags
  const { shapeFlag } = vnode
  if (shapeFlag & ShapeFlags.ELEMENT) {
    processElement(vnode, container)
  } else if (shapeFlag & ShapeFlags.STATEFUL_COMPOMENT) {
    processComponent(vnode, container)
  }

  
}

function processElement(vnode, container) {
  mountElement(vnode, container)
}

function mountElement(vnode, container) {
  const el = vnode.el = document.createElement(vnode.type)

  const {children} = vnode

  // 判断 childre 是否是数组
  if (typeof children === 'string') {
    el.textContent = vnode.children
  } else if (Array.isArray(children)) {
    // children.forEach(v => patch(v, el))
    mountChildren(children, el)
  }
  
  const { props } = vnode
  for (let key in props) {
    const value = props[key]
    el.setAttribute(key, value)
  }

  container.append(el)
}

function mountChildren (children, container) {
  children.forEach(v => patch(v, container))
}

// 处理 component
function processComponent(vnode, container) {
  mountComponent(vnode, container)
}

// 挂载组件
function mountComponent(initialVnode, container) {
  // 创建实例
  const instance = createComponentInstance(initialVnode) // {vnode: vnode, type: vnode.type}
  setupComponent(instance)
  setupRenderEffect(instance, initialVnode, container)
}


function setupRenderEffect(instance, initialVnode, container) {
  // rend 的时候绑定代理对象
  const { proxy } = instance

  const subTree = instance.render.call(proxy)

  patch(subTree, container)

  initialVnode.el = subTree.el
}
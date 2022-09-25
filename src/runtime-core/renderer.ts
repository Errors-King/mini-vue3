import { createComponentInstance, setupComponent } from "./component"

export function render (vnode, container) {
  // 执行patch
  patch(vnode, container)
}

function patch (vnode, container) {
  // 判断 vnode 时 component 还是 element，并执行对应的处理逻辑

  processComponent(vnode, container)
}

// 处理 component
function processComponent(vnode, container) {
  mountComponent(vnode, container)
}

// 挂载组件
function mountComponent(vnode, container) {
  // 创建实例
  const instance = createComponentInstance(vnode)
  setupComponent(instance)
  setupRenderEffect(instance, container)
}


function setupRenderEffect(instance, container) {
  const subTree = instance.render()

  patch(subTree, container)
}
import { createVNode } from "./createVNode"
import { render } from "./renderer"

// 1 创建 App
export function createApp (rootComponent) {
  return {
    // 2 挂载
    mount (rootContainer) {
      // 3 创建虚拟节点
      const vnode = createVNode(rootComponent)
      // 4 渲染到容器上
      render(vnode, createContainer(rootContainer))
    }
  }
}

function createContainer (container) {
  if (typeof container === 'string') {
    return document.querySelector(container)
  }
  return container
}



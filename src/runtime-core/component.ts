import { PublicInstanceProxyHandlers } from "./componentPublicInstance"

// 创建实例
export function createComponentInstance (vnode) {
  const component = {
    vnode,
    type: vnode.type,
    setupState: {}
  }
  return component
}

// 构建组件
export function setupComponent (instance) {
  // initProps()
  // initSlots()

  setupStatefulComponent(instance)
}

// 构建组件状态
function setupStatefulComponent (instance) {
  const Component = instance.type

  // 为 instance 增加代理对象
  instance.proxy = new Proxy({_: instance}, PublicInstanceProxyHandlers)
  const { setup } = Component

  if (setup) {
    const setupRes = setup()
    handleSetupRes(instance, setupRes)
  }
}

// 处理组件的 setup 的结果
function handleSetupRes (instance, setupRes) {
  if (typeof setupRes === 'object') {
    instance.setupState = setupRes
  }

  finishComponentSetup(instance)
}

function finishComponentSetup(instance) {
  const Component = instance.type

  if (Component.render) {
    instance.render = Component.render
  }
}
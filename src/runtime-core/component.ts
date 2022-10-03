import { shallowReadonly } from "../reactivity/reactive"
import { proxyRefs } from "../reactivity/ref"
import { emit } from "./componentEmit"
import { initProps } from "./componentProps"
import { PublicInstanceProxyHandlers } from "./componentPublicInstance"
import { initSlots } from "./componentSlots"

let currentInstance = null // 当前实例

// 创建实例
export function createComponentInstance (vnode, parent) {
  console.log(parent)
  const component = {
    vnode,
    type: vnode.type,
    setupState: {},
    props: {},
    parent,
    emit: () => {},
    slots: {},
    provides: parent ? parent.provides : {},
    isMounted: false,
    subTree: null
  }
  component.emit = emit.bind(null, component) as any
  return component
}

// 构建组件
export function setupComponent (instance) {
  initProps(instance, instance.vnode.props)
  initSlots(instance, instance.vnode.children)

  setupStatefulComponent(instance)
}

// 构建组件状态
function setupStatefulComponent (instance) {
  const Component = instance.type

  // 为 instance 增加代理对象
  instance.proxy = new Proxy({_: instance}, PublicInstanceProxyHandlers)
  const { setup } = Component

  if (setup) {
    setCurrentInstance(instance)
    // 传入 props, 并且把 props 用 shallowReadonly 包裹，因为 props 是不允许修改的
    const setupRes = setup(shallowReadonly(instance.props), {
      emit: instance.emit
    })
    setCurrentInstance(null)
    handleSetupRes(instance, setupRes)
  }
}

// 处理组件的 setup 的结果
function handleSetupRes (instance, setupRes) {
  if (typeof setupRes === 'object') {
    instance.setupState = proxyRefs(setupRes)
  }

  finishComponentSetup(instance)
}

function finishComponentSetup(instance) {
  const Component = instance.type

  if (Component.render) {
    instance.render = Component.render
  }
}

export function getCurrentInstance () {
  return currentInstance
}

export function setCurrentInstance (newInstance) {
  currentInstance = newInstance
}
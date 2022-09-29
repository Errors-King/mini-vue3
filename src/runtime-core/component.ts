import { shallowReadonly } from "../reactivity/reactive"
import { emit } from "./componentEmit"
import { initProps } from "./componentProps"
import { PublicInstanceProxyHandlers } from "./componentPublicInstance"

// 创建实例
export function createComponentInstance (vnode) {
  const component = {
    vnode,
    type: vnode.type,
    setupState: {},
    props: {},
    emit: () => {}
  }
  component.emit = emit.bind(null, component) as any
  return component
}

// 构建组件
export function setupComponent (instance) {
  initProps(instance, instance.vnode.props)
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
    // 传入 props, 并且把 props 用 shallowReadonly 包裹，因为 props 是不允许修改的
    const setupRes = setup(shallowReadonly(instance.props), {
      emit: instance.emit
    })
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
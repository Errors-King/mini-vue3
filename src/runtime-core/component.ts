
// 创建实例
export function createComponentInstance (vnode) {
  const component = {
    vnode,
    type: vnode.type
  }
  return component
}

export function setupComponent (instance) {
  // initProps()
  // initSlots()

  setupStatefulComponent(instance)
}

function setupStatefulComponent (instance) {
  const Component = instance.type
  const { setup } = Component

  if (setup) {
    const setupRes = setup()
    handleSetupRes(instance, setupRes)
  }
}

function handleSetupRes (instance, setupRes) {
  if (typeof setupRes === 'object') {
    instance.setupRes = setupRes
  }

  finishComponentSetup(instance)
}

function finishComponentSetup(instance) {
  const Component = instance.type

  if (Component.render) {
    instance.render = Component.render
  }
}
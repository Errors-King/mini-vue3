
const publicPropertiesMap = {
  $el: instance => instance.vnode.el
}

export const PublicInstanceProxyHandlers = {
    get({_: instance}, key) {
      
      const publickGetter = publicPropertiesMap[key]
      if (publickGetter) {
        return publickGetter(instance)
      }

      const { setupState } = instance
      if (key in setupState) {
        return setupState[key]
      }
      
    }
}
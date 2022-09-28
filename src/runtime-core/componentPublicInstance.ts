import { hasOwn } from "../utils/index"

// 获取 $ 相关的
const publicPropertiesMap = {
  $el: instance => instance.vnode.el
}

// 代理对象拦截器
export const PublicInstanceProxyHandlers = {
    get({_: instance}, key) {
      
      const publickGetter = publicPropertiesMap[key]
      if (publickGetter) {
        return publickGetter(instance)
      }

      // 处理 setup 返回的
      const { setupState, props } = instance
      // if (key in setupState) {
      //   return setupState[key]
      // }

      // 使 this. 能够访问 setup 返回的 和 props
      if (hasOwn(setupState, key)) {
        return setupState[key]
      } else if (hasOwn(props, key)) {
        return props[key]
      }
      
    }
}
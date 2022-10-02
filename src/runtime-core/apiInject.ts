import { getCurrentInstance } from "./component";


export function provide (key, value) {
  // 获取当前实例
  const currentInstance: any = getCurrentInstance()
  // 给当前 instance 上挂属性
  if (currentInstance) {
    let { provides } = currentInstance

    // 当前组件如果需要使用 provide ，就不能直接用父级的了，需要自己创建
    const parentProvides = currentInstance.parent.provides
    // init, 因为在初始化 provides 的时候是赋值的 parent.provides
    if (provides === parentProvides) {
      // 利用原型链
      provides = currentInstance.provides = Object.create(parentProvides)
    }

    provides[key] = value
  }
}

// inject 支持默认值，支持默认值是函数
export function inject (key, defaultValue) {
  const currentInstance: any = getCurrentInstance()

  if (currentInstance) {
    const parentProvides = currentInstance.parent.provides

    // 查找 key
    if (key in parentProvides) {
      return parentProvides[key]
    } else if (defaultValue) {

      // 判断默认值是否是 函数
      if (typeof defaultValue === 'function') {
        return defaultValue()
      }

      return defaultValue

    }


    return parentProvides[key]

  }
}
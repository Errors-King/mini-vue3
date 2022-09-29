import { camelize, toHandlerkey } from "../utils/index"


export function emit(instance, event, ...args) {
  const { props } = instance
  // 处理事件名称

  const handlerName = toHandlerkey(camelize(event))

  const handle = props[handlerName]
  handle && handle(...args)
}
import { NodeTypes } from "./ast"

export function baseParse(content) {

  const context = createParserContext(content)

  return createRoot(parseChildren(context))

}


// 解析 children
function parseChildren(context) {

  const nodes: any = []

  let node
  if (context.source.startsWith("{{")) {
    node = parseInterpolation(context)
  }
  

  nodes.push(node)
  return nodes
}

// 解析 插值
function parseInterpolation(context) {

  const openDelimiter = "{{"
  const closeDelimiter = "}}"


  const closeIndex = context.source.indexOf(closeDelimiter, openDelimiter.length)

  

  advanceBy(context, openDelimiter.length)

  const rawContentLength = closeIndex - openDelimiter.length

  const rawContent = context.source.slice(0, rawContentLength)
  const content = rawContent.trim() // 处理空格情况

  // context.source = context.source.slice(rawContentLength + closeDelimiter.length)
  advanceBy(context, rawContentLength + closeDelimiter.length)

  return {
    type: NodeTypes.INTERPOLATION,
    content: {
      type: NodeTypes.SIMEPLE_EXPRESSION,
      content
    }
  }

}

// 移动
function advanceBy(context, length) {
  context.source = context.source.slice(length)
}

// 创建根对象
function createRoot(children) {
  return {
    children
  }
}

// 创建上下文
function createParserContext(content) {
  return {
    source: content
  }
}
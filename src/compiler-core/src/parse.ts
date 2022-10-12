import { NodeTypes, TagType } from "./ast"

export function baseParse(content) {

  const context = createParserContext(content)

  return createRoot(parseChildren(context))

}

// 创建上下文
function createParserContext(content) {
  return {
    source: content
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

// 解析 children
function parseChildren(context) {

  const nodes: any = []

  let node
  const s = context.source
  if (s.startsWith("{{")) {
    node = parseInterpolation(context)
  } else if (s[0] === '<') {
    if (/[a-z]/i.test(s[1])) {
      console.log('parse element')
      node = parseElement(context)
    }
  }

  if (!node) {
    node = parseText(context)
  }


  nodes.push(node)
  return nodes
}

// 解析 text
function parseText(context) {
  const content = context.source.slice(0, context.source.length)
  advanceBy(context, context.source.length)
  return {
    type: NodeTypes.TEXT,
    content: content
  }
}

// 解析 element
function parseElement(context) {

  // 1 解析
  // 2 删除

  const element = parseTag(context, TagType.Start)

  parseTag(context, TagType.End)

  return element

}

// 处理 tag
function parseTag(context: any, type: TagType) {
  const match: any = /^<\/?([a-z]*)/i.exec(context.source)

  const tag = match[1]

  advanceBy(context, match[0].length)
  advanceBy(context, 1)

  if (type === TagType.End) return

  return {
    type: NodeTypes.ElEMENT,
    tag
  }
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



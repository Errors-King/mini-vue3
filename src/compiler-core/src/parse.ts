import { NodeTypes, TagType } from "./ast"

export function baseParse(content) {

  const context = createParserContext(content)

  return createRoot(parseChildren(context, []))

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
    children,
    type: NodeTypes.ROOT
  }
}

// 解析 children
function parseChildren(context, ancestors) {

  const nodes: any = []

  // 循环解析 children
  while (!isEnd(context, ancestors)) {
    console.log('----------', context.source)
    let node
    const s = context.source
    if (s.startsWith("{{")) {
      console.log('interpolation')
      node = parseInterpolation(context)
    } else if (s[0] === '<') {
      if (/[a-z]/i.test(s[1])) {
        console.log('parse element')
        node = parseElement(context, ancestors)
      }
    }

    if (!node) {
      console.log('text')
      node = parseText(context)
    }

    nodes.push(node)
  }

  return nodes
}

function isEnd(context, ancestors) {
  // console.log('==========', parentTag)
  const s = context.source

  // if (parentTag && s.startsWith(`</${parentTag}>`)) {
  //   return true
  // }

  if (s.startsWith('</')) {
    for (let i = ancestors.length - 1; i >= 0; i--) {
      const tag = ancestors[i].tag
      if (s.slice(2, 2 + tag.length) === tag) {
        return true
      }
    }
  }

  return !s
}

// 解析 text
function parseText(context) {

  // 判断是否存在插值表达式
  let endIndex = context.source.length
  let endTokens = ["<", "{{"]

  for (let i = 0; i < endTokens.length; i++) {
    const index = context.source.indexOf(endTokens[i])
    if (index !== -1 && endIndex > index) {
      endIndex = index
    }
  }



  const content = context.source.slice(0, endIndex)
  advanceBy(context, endIndex)
  return {
    type: NodeTypes.TEXT,
    content: content
  }
}

// 解析 element
function parseElement(context, ancestors) {

  // 1 解析
  // 2 删除

  const element: any = parseTag(context, TagType.Start)
  ancestors.push(element)
  element.children = parseChildren(context, ancestors)
  ancestors.pop()

  if (element.tag === context.source.slice(2, 2 + element.tag.length)) {
    parseTag(context, TagType.End)
  } else {
    throw new Error('缺少结束标签')
  }
 

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



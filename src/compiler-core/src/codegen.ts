import { NodeTypes } from "./ast"

export function generate(ast) {
  // 创建全局对象
  const context = createCodegenContext()
  const { push } = context

  genFunctionPreamble(push, ast)

  const functionName = 'render'
  const args = ['_ctx', '_cache']
  const signature = args.join(', ')

  push(`function ${functionName} (${signature}) {`)
  // code += `return '${ast.children[0].content}'`
  push('return ')
  genNode(ast.codegenNode, context)
  push('}')

  return {
    code: context.code
  }
}

function genFunctionPreamble(push, ast) {
  const VueBinging = 'Vue'
  const aliaHelper = (s) => `${s}: _${s}`
  if (ast.length > 0) {
    const props = ast.helpers.map(aliaHelper).join(', ')
    push(`const { ${props} } = ${VueBinging}`)
  }
  push('\n')
  push('return ')
}

function genNode(node, context) {
  switch (node.type) {
    case NodeTypes.TEXT:
      genText(node, context)
      break;
    case NodeTypes.INTERPOLATION:
      genIterplpation(node, context)
      break
    case NodeTypes.SIMEPLE_EXPRESSION:
      genExpression(node, context)
    default:
      break;
  }

}

function genText(node: any, context: any) {
  const { push } = context
  push(`'${node.content}'`)
}

function genIterplpation(node: any, context: any) {
  const { push } = context
  push(`_toDisplayString(`)
  genNode(node.content, context)
  push(')')
}

function genExpression(node: any, context: any) {
  const { push } = context
  push(`${node.content}`)
}

function createCodegenContext(): any {
  const context = {
    code: '',
    push(source) {
      context.code += source
    }
  }
  return context
}





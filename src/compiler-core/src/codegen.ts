export function generate(ast) {
  // 创建全局对象
  const context = createCodegenContext()
  const { push } = context

  push('return ')

  const functionName = 'render'
  const args = ['_ctx', '_cache']
  const signature = args.join(', ')

  push(`function ${functionName} (${signature}) {`)
  // code += `return '${ast.children[0].content}'`
  push('return ')
  genCode(ast.codegenNode, context)
  push('}')

  return {
    code: context.code
  }
}

function genCode(node, context) {
  context.push(`'${node.content}'`)
}

function createCodegenContext():any {
  const context = {
    code: '',
    push(source) {
      context.code += source
    }
  }
  return context
}
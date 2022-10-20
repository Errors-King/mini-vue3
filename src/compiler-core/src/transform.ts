import { NodeTypes } from "./ast"

export function transform(root, options = {}) {
  const context = createTransformContext(root, options)
  // 挂上 codeGenNode
  createCodegen(root)
  // 遍历
  traversNode(root, context)

  root.helpers = [...context.helpers.keys()]
}

function createCodegen(root) {
  root.codegenNode = root.children[0]
}

function createTransformContext(root, options) {
  const context = {
    root,
    nodeTransforms: options.nodeTransforms || [],
    helpers: new Map(),
    helper(key) {
      context.helpers.set(key, 1)
    }
  }
  return context
}

function traversNode(node: any, context) {

  const nodeTransforms = context.nodeTransforms
  for (let i = 0; i < nodeTransforms.length; i++) {
    const nodeTransform = nodeTransforms[i]
    nodeTransform(node)
  }

  switch (node.type) {
    case NodeTypes.INTERPOLATION:
      context.helper('toDisplayString')
      break;
    case NodeTypes.ROOT:
    case NodeTypes.ElEMENT:
      traversChildren(node, context)
      break
    default:
      break;
  }
  console.log(node)

  // if (node.type === NodeTypes.TEXT) {
  //   node.content += 'vue3'
  // }

}

function traversChildren(node, context) {
  const children = node.children
  
  for (let i = 0; i < children.length; i++) {
    const node = children[i]
    traversNode(node, context)
  }

}
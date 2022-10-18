import { NodeTypes } from "./ast"

export function transform (root, options) {
  const context = createTransformContext(root, options)
  // 遍历
  traversNode(root, context)
}

function createTransformContext(root, options) {
  return {
    root,
    nodeTransforms: options.nodeTransforms || []
  }
}

function traversNode (node: any, context) {

  const nodeTransforms = context.nodeTransforms
  for (let i = 0; i < nodeTransforms.length; i++) {
    const nodeTransform = nodeTransforms[i]
    nodeTransform(node)
  }
  console.log(node)

  // if (node.type === NodeTypes.TEXT) {
  //   node.content += 'vue3'
  // }
  traversChildren(node, context)
}

function traversChildren (node, context) {
  const children = node.children

  if (children) {
    for (let i = 0; i < children.length; i++) {
      const node = children[i]
      traversNode(node, context)
    }
  }
}
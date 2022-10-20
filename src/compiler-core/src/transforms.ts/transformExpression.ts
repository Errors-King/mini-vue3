import { NodeTypes } from "../ast";

export function transformExpression (node) {
  if (node.type === NodeTypes.INTERPOLATION) {

    const rawContect = node.content.content
    node.content.content = '_ctx.' + rawContect
  }
}
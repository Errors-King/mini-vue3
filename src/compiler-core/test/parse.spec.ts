import { NodeTypes } from '../src/ast'
import { baseParse } from '../src/parse'

describe('Parse', () => {

  describe('interpolation', () => {

    it('simple', () => {
      const ast = baseParse("{{message}}")

      expect(ast.children[0]).toStrictEqual({
        type: NodeTypes.INTERPOLATION,
        content: {
          type: NodeTypes.SIMEPLE_EXPRESSION,
          content: 'message'
        }
      })
    })
  })
})
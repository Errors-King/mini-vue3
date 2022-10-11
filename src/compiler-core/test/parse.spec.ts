

describe('Parse', () => {

  describe('interpolation', () => {

    it('simple', () => {
      const ast = baseParse("{{message}}")

      expect(ast.children[0]).toStrictEqual({
        type: 'interpolation',
        content: {
          type: 'simple_expression',
          content: 'message'
        }
      })
    })
  })
})
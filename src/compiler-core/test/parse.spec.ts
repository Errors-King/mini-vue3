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

  describe('element', () => {
    it('simple element div', () => {
      const ast = baseParse('<div></div>')

      expect(ast.children[0]).toStrictEqual({
        type: NodeTypes.ElEMENT,
        tag: 'div',
        children: []
      })
    })
  })

  describe('text', () => {
    it('parse text', () => {
      const ast = baseParse('hello world')

      expect(ast.children[0]).toStrictEqual({
        type: NodeTypes.TEXT,
        content: 'hello world'
      })
    })
  })

  it('hello world', () => {
    const ast = baseParse("<div>hi,{{ message }}</div>")
    expect(ast.children[0]).toStrictEqual({
      type: NodeTypes.ElEMENT,
      tag: 'div',
      children: [
        {
          type: NodeTypes.TEXT,
          content: "hi,",
        },
        {

          type: NodeTypes.INTERPOLATION,
          content: {
            type: NodeTypes.SIMEPLE_EXPRESSION,
            content: "message"
          },
        }

      ]
    })
  })

  it('Nested element', () => {
    const ast = baseParse('<div><p>hello</p>{{message}}</div>')

    expect(ast.children[0]).toStrictEqual({
      type: NodeTypes.ElEMENT,
      tag: 'div',
      children: [
        {
          type: NodeTypes.ElEMENT,
          tag: 'p',
          children: [
            {
              type: NodeTypes.TEXT,
              content: 'hello'
            }
          ]
        },
        {
          type: NodeTypes.INTERPOLATION,
          content: {
            type: NodeTypes.SIMEPLE_EXPRESSION,
            content: 'message'
          }
        }
      ]
    })
  })

  it('miss end single', () => {
    expect(() => {
      baseParse('<div><span></div>')
    }).toThrow('缺少结束标签')
  })
})
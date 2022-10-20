import { baseParse } from "../src/parse"
import { generate } from '../src/codegen'
import { transform } from "../src/transform"
import { transformExpression } from "../src/transforms.ts/transformExpression"


describe('codegen', () => {

  it('string', () => {
    const ast = baseParse('hello')

    transform(ast)
    
    const { code } = generate(ast)

    expect(code).toMatchSnapshot()
  })

  it('interpolation', () => {
    const ast = baseParse('{{message}}')

    transform(ast, {
      nodeTransforms: [transformExpression]
    })
    
    const { code } = generate(ast)

    expect(code).toMatchSnapshot()
  })

})
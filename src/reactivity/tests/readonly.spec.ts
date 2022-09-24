import { isProxy, isReadonly, readonly } from '../reactive'

describe("readonly", () => {
  it("happy path", () => {
    const raw = { age: 12, bar: { baz: 18}}
    const wrapped = readonly(raw)
    expect(wrapped).not.toBe(raw)
    expect(wrapped.age).toBe(12)
    expect(isProxy(wrapped)).toBe(true)
  })

  it("warn when call readonly set", () => {

    console.warn = jest.fn()
    const user = readonly({
      age: 18
    })
    user.age = 19

    expect(console.warn).toBeCalledTimes(1)
  })

  it("test isReadonly", () => {
    const raw = {age: 123}
    const only = readonly(raw)
    expect(isReadonly(only)).toBe(true)
    expect(isReadonly(raw)).toBe(false)
  })
})
import { isReadonly, shallowReadonly } from "../reactive";

describe("shallowReadonly", () => {
  it("内层对象应该为普通对象", () => {
    const raw = {
      bar: {
        age: 23
      }
    }
    const props = shallowReadonly(raw)
    console.warn = jest.fn()
    expect(isReadonly(props)).toBe(true)
    expect(isReadonly(props.bar)).toBe(false)
    props.bar = 0
    expect(console.warn).toBeCalledTimes(1)
  })
})

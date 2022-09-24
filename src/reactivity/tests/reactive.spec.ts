import {reactive, isReactive, isProxy} from '../reactive'

describe('reactive', () => {
  it('happy path', () => {
    const raw = { age: 1 }
    const observer = reactive(raw)
    expect(raw).not.toBe(observer)
    expect(observer.age).toBe(1)
    expect(isProxy(observer)).toBe(true)
    expect(isReactive(observer)).toBe(true)
    expect(isReactive(raw)).toBe(false)
    expect
  })

  it('nested reactive', () => {
    const raw = {
      nested: {
        age: 12
      },
      arr: [{name: 'rose'}]
    }

    const observed = reactive(raw)
    expect(isReactive(observed.nested)).toBe(true)
    expect(isReactive(observed.arr)).toBe(true)
    expect(isReactive(observed.arr[0])).toBe(true)
  })
})
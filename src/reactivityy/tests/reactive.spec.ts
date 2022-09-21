import {reactive} from '../reactive'

describe('reactive', () => {
  it('happy path', () => {
    const raw = { age: 1 }
    const observer = reactive(raw)
    expect(raw).not.toBe(observer)
    expect(observer.age).toBe(1)
  })
})
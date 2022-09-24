import { computed } from "../computed"
import { reactive } from "../reactive"

describe("computed", () => {
  it("happy path", () => {
    const test = reactive({
      age: 12
    })
  
    const age = computed(() => {
      return test.age
    })
  
    expect(age.value).toBe(12)
  })

  it("should compute lazily", () => {
    const value = reactive({
      foo: 1,
    });
    const getter = jest.fn(() => {
      return value.foo;
    });
    const cValue = computed(getter);

    // 不触发 get 不执行
    expect(getter).not.toHaveBeenCalled();

    expect(cValue.value).toBe(1);
    expect(getter).toHaveBeenCalledTimes(1);

    // 依赖没变化的时候，不需要重新执行函数
    cValue.value;
    expect(getter).toHaveBeenCalledTimes(1);

    // 依赖发生变化
    value.foo = 2;
    expect(getter).toHaveBeenCalledTimes(1);

    // 当触发 get 时，才会去执行
    expect(cValue.value).toBe(2);
    expect(getter).toHaveBeenCalledTimes(2);
  });
  
})
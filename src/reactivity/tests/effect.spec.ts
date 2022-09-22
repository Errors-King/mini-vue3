import { effect, stop } from "../effect";
import { reactive } from "../reactive";

describe("effect", () => {
  it("happy path", () => {
    const user = reactive({
      name: 'lihua',
      age: 18
    })

    let age = null
    effect(() => {
      age = user.age + 1
    })

    expect(age).toBe(19)
    user.age++
    expect(age).toBe(20)
  })

  it("should return a function and excu it", () => {
    let runner = effect(() => {
      return 12
    })
    expect(runner()).toBe(12)
  })


  it("scheduler", () => {
    let test: any
    let observer = reactive({age: 12})
    let run: any
    const scheduler = jest.fn(() => {
      run = runner
    })
    const runner = effect(() => {
      test = observer.age
    }, { scheduler })
    expect(scheduler).not.toHaveBeenCalled()
    expect(test).toBe(12)
    observer.age++
    expect(scheduler).toHaveBeenCalledTimes(1)
    expect(run).toBe(runner)
  })

  it("stop", () => {
    let dummy;
    const obj = reactive({ prop: 1 });
    const runner = effect(() => {
      dummy = obj.prop;
    });
    obj.prop = 2;
    expect(dummy).toBe(2);
    stop(runner);
    // obj.prop = 3
    obj.prop++;
    expect(dummy).toBe(2);
    runner();
    expect(dummy).toBe(3);
  });

  it("onStop", () => {
    const obj = reactive({
      age: 12
    })
    const onStop = jest.fn()
    let test
    const runner = effect(() => {
      test = obj.age
    }, {
      onStop
    })

    stop(runner)
    expect(onStop).toBeCalledTimes(1)
  })
})
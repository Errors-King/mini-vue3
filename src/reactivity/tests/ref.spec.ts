import { effect } from "../effect";
import { reactive } from "../reactive";
import { isRef, proxyRefs, ref, unRef } from "../ref";
describe("ref", () => {

  it("happy path", () => {
    const test = ref(2)
    expect(test.value).toBe(2)
  })

  it("should be reactive", () => {
    const test = ref(1);
    let dummy;
    let calls = 0;
    effect(() => {
      calls++;
      dummy = test.value;
    });
    expect(calls).toBe(1);
    expect(dummy).toBe(1);
    test.value = 2;
    expect(calls).toBe(2);
    expect(dummy).toBe(2);

    test.value = 2;
    expect(calls).toBe(2);
    expect(dummy).toBe(2);
  });

  it("should make nested properties reactive", () => {
    const a = ref({
      count: 1,
    })
    let dummy;
    effect(() => {
      dummy = a.value.count;
    })
    expect(dummy).toBe(1)
    a.value.count = 2
    expect(dummy).toBe(2)
  })

  it("isRef", () => {
    const test = ref(1);
    const peopel= reactive({
      age: 1,
    });
    expect(isRef(test)).toBe(true);
    expect(isRef(1)).toBe(false);
    expect(isRef(peopel)).toBe(false);
  })

   it("unRef", () => {
    const test = ref(1);
    expect(unRef(test)).toBe(1);
    expect(unRef(1)).toBe(1);
  })

  it("proxyRefs", () => {
    const user = {
      age: ref(10),
      name: "xiaohong",
    };
    const proxyUser = proxyRefs(user);
    expect(user.age.value).toBe(10);
    expect(proxyUser.age).toBe(10);
    expect(proxyUser.name).toBe("xiaohong");

    proxyUser.age = 20;
    expect(proxyUser.age).toBe(20);
    expect(user.age.value).toBe(20);

    proxyUser.age = ref(10);
    expect(proxyUser.age).toBe(10);
    expect(user.age.value).toBe(10);
  });
});

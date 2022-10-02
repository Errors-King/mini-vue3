// 组件 provide 和 inject 功能
import {
  h,
  provide,
  inject,
} from "../../lib/mini-vue.esm.js";

const ProviderOne = {
  setup() {
    provide("foo", "foo");
    provide("bar", "bar");
    
  },
  render() {
    return h('div', {}, [h('p', {}, 'ProviderOne'), h(ProviderTwo)]);
  }
};

const ProviderTwo = {
  setup() {
    provide('foo', 'fooTwo')
    let foo = inject('foo')
    return {
      foo
    }
  },
  render() {
    return h('div', {}, [h('p', {}, `ProviderTwo-${this.foo}`), h(Consumer)]);
  }
};

const Consumer = {
  setup() {
    const foo = inject("foo");
    const bar = inject("bar");
    const baz = inject("baz", "11111")
    return {
      foo,
      bar,
      baz
    }
  },
  render() {
    return h("div", {}, `Constomer-${this.foo}-${this.bar}-${this.baz}`);
  }
};

export default {
  name: "App",
  setup() {
    return {}
  },
  render() {
    return h('div', {}, [h('div', {}, 'apiInject'), h(ProviderOne)])
  }
};

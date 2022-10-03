
import { h, ref } from "../../lib/mini-vue.esm.js";

export default {
  name: "App",
  setup() {
    const count = ref(0);

    const onClick = () => {
      count.value++
    }

    const props = ref({
      foo: 'foo',
      bar: 'bar'
    })

    const onChangePropsDemo1 = () => {
      props.value.foo = 'new-foo'
    }

    const onChangePropsDemo2 = () => {
      props.value.foo = undefined
    }

    const onChangePropsDemo3 = () => {
      props.value = {
        foo: 'foo'
      }
    }

    return {
      count,
      props,
      onClick,
      onChangePropsDemo1,
      onChangePropsDemo2,
      onChangePropsDemo3
    }
  },

  render() {
    return h(
      'div',
      {
        id: 'app',
        ...this.props
      },
      [
        h('div', {},  `count: ${this.count}`),
        h('button', { onClick: this.onClick}, 'click'),
        h('button', { onClick: this.onChangePropsDemo1}, '修改值'),
        h('button', { onClick: this.onChangePropsDemo2}, '删除值(undefinde | null)'),
        h('button', { onClick: this.onChangePropsDemo3}, '删除值(没了)'),
      ]
    )
  },
};

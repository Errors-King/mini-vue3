
import { h, ref } from "../../lib/mini-vue.esm.js";
import Child from './Child.js'

export default {
  name: "App",
  setup() {
    const count = ref(1);
    const msg = ref('123')

    const onClick = () => {
      count.value++
    }

    const changeChildProps = () => {
      msg.value = '456'
    }

    return {
      count,
      onClick,
      msg,
      changeChildProps
    }
  },

  render() {
    return h(
      'div',
      {
        id: 'root'
      },
      [
        h('div', {}, '你好'),
        h('button', {
          onClick: this.changeChildProps
        },  `change child props`),
        h(Child, { msg: this.msg}),
        h('button', {
          onClick: this.onClick
        }, 'change self count'),
        h('p', {}, `count : ${this.count}`)
      ]
    )
  },
};

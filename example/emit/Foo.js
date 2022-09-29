import { h } from "../../lib/mini-vue.esm.js"

export default {

  setup: function (props, { emit }) {
    const emitAdd = () => {
      console.log('emit-add')
      emit('emit-add', 1, 2)
    }
    return {
      emitAdd
    }
  },

  render: function () {
    const btn = h('button', {
      onClick: this.emitAdd
    }, 'emit')

    const foo = h('p', {}, this.msg)
    return h('div', {}, [foo, btn])
  }
}
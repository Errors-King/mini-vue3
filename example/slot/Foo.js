import { h, renderSlots } from "../../lib/mini-vue.esm.js"

export default {

  setup: function (props, { emit }) {
    return {}
  },

  render: function () {
    const name = 'foo'
    const foo = h('p', {class: 'jjj'}, '111')
    return h('div', {class: 'ffff'}, [renderSlots(this.$slots, 'header', {name}), foo, renderSlots(this.$slots, 'footer')])
  }
}
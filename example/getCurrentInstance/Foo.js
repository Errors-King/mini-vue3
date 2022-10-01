import { h, getCurrentInstance } from "../../lib/mini-vue.esm.js"

export default {
  name: 'Foo',
  setup: function (props, { emit }) {
    let instance = getCurrentInstance()
    console.log(instance)
    return {}
  },

  render: function () {
    
    return h('div', {class: 'ffff'}, 'hellow')
  }
}
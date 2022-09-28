import { h } from "../../lib/mini-vue.esm.js"

export default {

  setup: function (props) {
    console.log(props)
    props.msg = 'jjjjj'
    console.log(props)
  },

  render: function () {
    return h('div', {}, this.msg)
  }
}
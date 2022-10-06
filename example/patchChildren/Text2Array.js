import { h, ref } from "../../lib/mini-vue.esm.js"

export default {
  name: 'Text2Array',

  setup () {
    const isChange = ref(false)

    window.isChange = isChange

    return {
      isChange
    }
  },
  render () {
    return this.isChange === false ?
           h('div', {}, 'oldChildren') :
           h('div', {}, [h('div', {}, '123'), h('div', {}, '456')])
  }
}
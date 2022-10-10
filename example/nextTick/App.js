import { ref, h } from "../../lib/mini-vue.esm.js"

export default {
  name: 'App',
  setup () {
    const count = ref(1)

    function onClick () {
      for (let i = 0; i < 100; i++) {
        console.log(i)
        count.value = i
      }
    }

    return {
      count,
      onClick
    }
  },
  render () {
    const button = h('button', { onClick: this.onClick }, 'update')
    const p = h('p', {}, `count : ${this.count}`)
    return h('div', {}, [button, p])
  }
}
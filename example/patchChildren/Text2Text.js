import { ref, h } from '../../lib/mini-vue.esm.js'

const preChildren = 'oldChildren'
const nextChildren = 'nextChildren'

export default {
  name: 'text2text',
  setup () {
    const isChange = ref(false)

    window.isChange = isChange
    return {
      isChange
    }
  },
  render () {
    return this.isChange === true ? 
           h('div', {}, nextChildren) : 
           h('div', {}, preChildren)
  }
}
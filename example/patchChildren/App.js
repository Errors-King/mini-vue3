import { h } from '../../lib/mini-vue.esm.js'

import Array2Text from './Array2Text.js'
import Text2Text from './Text2Text.js'
// import Text2Array from './Text2Array.js'
// import Array2Array from './Array2Array.js'

export default {
  name: 'App',

  setup() {},

  render () {
    return h('div', {tId: 1}, [
      h('p', {}, '首页'),
      // h(Array2Text),
      h(Text2Text)
    ])
  }
}
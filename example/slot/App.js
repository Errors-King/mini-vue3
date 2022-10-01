import { h, createTextVNode } from '../../lib/mini-vue.esm.js'
import Foo from './Foo.js'
export const App = {

  render() {
    const app = h('div', {}, 'App')

    const foo = h(Foo, {}, {
      header: ({name}) => [h('p', {}, 'slots' + name), createTextVNode('你好')],
      footer: () => h('p', {}, '123')
    })

    return h('div', {}, [app, foo])

  },
  setup() {
    return {
      msg: 'hellow world'
    }
  }
}
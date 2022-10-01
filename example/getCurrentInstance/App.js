import { getCurrentInstance, h } from '../../lib/mini-vue.esm.js'
import Foo from './Foo.js'
export const App = {
  name: 'App',
  render() {

    return h(Foo, {class: 'ff'})

  },
  setup() {
    console.log(getCurrentInstance())
    return {
      msg: 'hellow world'
    }
  }
}
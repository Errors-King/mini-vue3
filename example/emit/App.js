import { h } from '../../lib/mini-vue.esm.js'
import Foo from './Foo.js'
window.self = null
export const App = {


  render() {
    window.self = this
    return h('div', {
      class: ['parimiry', 'samlle']
    }, [
      h('div', {class: 'jj'}, this.msg),
      h(Foo, {msg: this.msg,
        onEmitAdd: (a, b) => console.log('onEmitAdd', a, b)
      })
    ])


    // return h('div', {
    //   class: 'parent'
    // }, [
    //   h('p', {
    //     class: 'red'
    //   }, 'hilo'),
    //   h('p', {
    //     class: 'green'
    //   }, 'world')
    // ])
  },
  setup() {
    return {
      msg: 'hellow world'
    }
  }
}
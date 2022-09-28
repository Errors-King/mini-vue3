import { h } from '../../lib/mini-vue.esm.js'
import Foo from './Foo.js'
window.self = null
console.log(222222)
export const App = {


  render() {
    window.self = this
    return h('div', {
      class: ['parimiry', 'samlle'],
      onClick: () => console.log('click')
    }, [
      h('div', {class: 'jj'}, this.msg),
      h(Foo, {msg: this.msg})
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
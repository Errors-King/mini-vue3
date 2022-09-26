import { h } from '../../lib/mini-vue.esm.js'
window.self = null
export const App = {


  render() {
    window.self = this
    return h('div', {
      class: ['parimiry', 'samlle']
    }, this.msg)
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
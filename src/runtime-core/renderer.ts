
import { effect } from "../reactivity/effect"
import { isOn } from "../utils/index"
import { ShapeFlags } from "../utils/shapeFlags"
import { createComponentInstance, setupComponent } from "./component"
import { createAppAPI } from "./createApp"
import { Fragment, Text } from "./createVNode"


export function createRenderer(options) {

  const { createElement: hostCreateElement, patchProp: hostPatchProp, insert: hostInsert } = options

  function render(vnode, container) {
    // 执行patch
    patch(null, vnode, container, null)
  }

  function patch(n1, n2, container, parentComponent) {
    // 判断 vnode 时 component 还是 element，并执行对应的处理逻辑

    // shapeFlags
    const { shapeFlag, type } = n2
    switch (type) {
      case Fragment:
        processFragment(n1, n2, container, parentComponent)
        break;
      case Text:
        processText(n1, n2, container)
        break;
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          processElement(n1, n2, container, parentComponent)
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPOMENT) {
          processComponent(n1, n2, container, parentComponent)
        }
        break;
    }


  }

  // 处理 component
  function processComponent(n1, n2, container, parentComponent) {
    mountComponent(n2, container, parentComponent)
  }

  function processElement(n1, n2, container, parentComponent) {
    if (!n1) {
      mountElement(n2, container, parentComponent)
    } else {
      patchElement(n1, n2, container, parentComponent)
    }
  }

  function processFragment(n1, n2: any, container: any, parentComponent) {
    mountChildren(n2.children, container, parentComponent)
  }

  function processText(n1, n2, container) {
    const { children } = n2
    const textNode = n2.el = document.createTextNode(children)
    container.append(textNode)
  }


  // 挂载组件
  function mountComponent(initialVnode, container, parentComponent) {
    // 创建实例
    const instance = createComponentInstance(initialVnode, parentComponent) // {vnode: vnode, type: vnode.type}
    setupComponent(instance)
    setupRenderEffect(instance, initialVnode, container)
  }

  function mountElement(vnode, container, parentComponent) {
    const el = vnode.el = hostCreateElement(vnode.type)

    const { children } = vnode

    // 判断 childre 是否是数组
    if (typeof children === 'string') {
      el.textContent = vnode.children
    } else if (Array.isArray(children)) {
      // children.forEach(v => patch(v, el))
      mountChildren(children, el, parentComponent)
    }

    const { props } = vnode
    for (let key in props) {
      const value = props[key]

      // 判断是否是需要注册事件
      // if (isOn(key)) {
      //   const event = key.slice(2).toLowerCase()
      //   el.addEventListener(event, value)
      // } else {
      //   el.setAttribute(key, value)
      // }

      hostPatchProp(el, key, value)

    }

    // container.append(el)
    hostInsert(el, container)
  }

  function mountChildren(children, container, parentComponent) {
    children.forEach(v => patch(null, v, container, parentComponent))
  }

  function patchElement(n1, n2, container, parentComponent) {
    console.log('patchElement')
    console.log('n1', n1)
    console.log('n2', n2)
  }


  function setupRenderEffect(instance, initialVnode, container) {
    // rend 的时候绑定代理对象
    effect(() => {

      // mount
      if (!instance.isMounted) {
        console.log('mount')
        const { proxy } = instance

        const subTree = instance.subTree = instance.render.call(proxy)

        patch(null, subTree, container, instance)

        initialVnode.el = subTree.el

        instance.isMounted = true
      } else {
        // update
        console.log('update')
        const { proxy } = instance

        const subTree = instance.render.call(proxy)

        const preSubTree = instance.subTree

        instance.subTree = subTree

        // console.log(subTree)
        // console.log(preSubTree)

        patch(preSubTree, subTree, container, instance)

        // initialVnode.el = subTree.el

      }
    })
  }

  return {
    createApp: createAppAPI(render)
  }
}



import { effect } from "../reactivity/effect"
import { isOn } from "../utils/index"
import { ShapeFlags } from "../utils/shapeFlags"
import { createComponentInstance, setupComponent } from "./component"
import { createAppAPI } from "./createApp"
import { Fragment, Text } from "./createVNode"


export function createRenderer(options) {

  const {
    createElement: hostCreateElement,
    patchProp: hostPatchProp,
    insert: hostInsert,
    remove: hostRemove,
    setElementText: hostSetElementText
  } = options

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

  // 处理元素
  function processElement(n1, n2, container, parentComponent) {
    // 判断是更新还是挂载
    if (!n1) {
      mountElement(n2, container, parentComponent)
    } else {
      patchElement(n1, n2, container, parentComponent)
    }
  }

  // 处理 片段
  function processFragment(n1, n2: any, container: any, parentComponent) {
    mountChildren(n2.children, container, parentComponent)
  }

  // 处理文本
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

  // 挂载元素
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

      hostPatchProp(el, key, null, value)

    }

    // container.append(el)
    hostInsert(el, container)
  }

  // 挂载子级
  function mountChildren(children, container, parentComponent) {
    children.forEach(v => patch(null, v, container, parentComponent))
  }

  // 更新element流程
  function patchElement(n1, n2, container, parentComponent) {
    console.log('patchElement')
    console.log('n1', n1)
    console.log('n2', n2)

    const oldProps = n1.props || EMPTY_OBJ
    const newProps = n2.props || EMPTY_OBJ

    const el = (n2.el = n1.el)

    patchChildren(n1, n2, el, parentComponent)
    patchProps(el, oldProps, newProps)
  }

  const EMPTY_OBJ = {} // 初始化 props

  // 更新 props
  function patchProps(el, oldProps, newProps) {
    // 只有当新旧 props 不一样才 进行 patch
    if (oldProps !== newProps) {
      for (let key in newProps) {
        const preProp = oldProps[key]
        const newProp = newProps[key]

        if (preProp !== newProp) {
          hostPatchProp(el, key, preProp, newProp)
        }

        // 貌似没必要 判断
        if (oldProps !== EMPTY_OBJ) {
          for (let key in oldProps) {
            console.log(key, oldProps, newProp)
            if (!(key in newProps)) {
              hostPatchProp(el, key, oldProps[key], null)
            }
          }
        }
      }
    }
  }

  function patchChildren(n1, n2, container, parentComponent) {

    const preShapeFlag = n1.shapeFlag
    const c1 = n1.children
    const { shapeFlag } = n2
    const c2 = n2.children

    // Array2Text
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      if (preShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        // 移除所有 child
        unmountChildren(n1.children)

      }
      // 设置新的 textChild (Text2Text)
      if (c1 !== c2) {
        hostSetElementText(container, c2)
      }
    } else {
      // Text2Array
      if (preShapeFlag & ShapeFlags.TEXT_CHILDREN) {
        // 清空文本
        hostSetElementText(container, '')
        mountChildren(c2, container, parentComponent)
      }
    }
  }

  function unmountChildren(children) {
    for (let i = 0; i < children.length; i++) {
      const el = children[i].el
      hostRemove(el)
    }
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


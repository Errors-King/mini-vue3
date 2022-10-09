
import { effect } from "../reactivity/effect"
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
    patch(null, vnode, container, null, null)
  }

  function patch(n1, n2, container, parentComponent, anchor) {
    // 判断 vnode 时 component 还是 element，并执行对应的处理逻辑

    // shapeFlags
    const { shapeFlag, type } = n2
    switch (type) {
      case Fragment:
        processFragment(n1, n2, container, parentComponent, anchor)
        break;
      case Text:
        processText(n1, n2, container)
        break;
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          processElement(n1, n2, container, parentComponent, anchor)
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPOMENT) {
          processComponent(n1, n2, container, parentComponent, anchor)
        }
        break;
    }


  }

  // 处理 component
  function processComponent(n1, n2, container, parentComponent, anchor) {
    mountComponent(n2, container, parentComponent, anchor)
  }

  // 处理元素
  function processElement(n1, n2, container, parentComponent, anchor) {
    // 判断是更新还是挂载
    if (!n1) {
      mountElement(n2, container, parentComponent, anchor)
    } else {
      patchElement(n1, n2, container, parentComponent, anchor)
    }
  }

  // 处理 片段
  function processFragment(n1, n2: any, container: any, parentComponent, anchor) {
    mountChildren(n2.children, container, parentComponent, anchor)
  }

  // 处理文本
  function processText(n1, n2, container) {
    const { children } = n2
    const textNode = n2.el = document.createTextNode(children)
    container.append(textNode)
  }


  // 挂载组件
  function mountComponent(initialVnode, container, parentComponent, anchor) {
    // 创建实例
    const instance = createComponentInstance(initialVnode, parentComponent) // {vnode: vnode, type: vnode.type}
    setupComponent(instance)
    setupRenderEffect(instance, initialVnode, container, anchor)
  }

  // 挂载元素
  function mountElement(vnode, container, parentComponent, anchor) {
    const el = vnode.el = hostCreateElement(vnode.type)

    const { children } = vnode

    // 判断 childre 是否是数组
    if (typeof children === 'string') {
      el.textContent = vnode.children
    } else if (Array.isArray(children)) {
      // children.forEach(v => patch(v, el))
      mountChildren(children, el, parentComponent, anchor)
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
    hostInsert(el, container, anchor)
  }

  // 挂载子级
  function mountChildren(children, container, parentComponent, anchor) {
    children.forEach(v => patch(null, v, container, parentComponent, anchor))
  }

  // 更新element流程
  function patchElement(n1, n2, container, parentComponent, anchor) {
    console.log('patchElement')
    console.log('n1', n1)
    console.log('n2', n2)

    const oldProps = n1.props || EMPTY_OBJ
    const newProps = n2.props || EMPTY_OBJ

    const el = (n2.el = n1.el)

    patchChildren(n1, n2, el, parentComponent, anchor)
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

  function patchChildren(n1, n2, container, parentComponent, anchor) {

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
        mountChildren(c2, container, parentComponent, anchor)
      } else {
        // 处理 Array2Array， 采用双端对比算法
        patchKeyedChildren(c1, c2, container, parentComponent, anchor)
      }
    }
  }

  function patchKeyedChildren(c1, c2, container, parentComponent, parentAnchor) {
    const l2 = c2.length
    let i = 0
    let e1 = c1.length - 1
    let e2 = l2 - 1

    // 判断是否是相同的节点
    function isSomeVNodeType(n1, n2) {
      return n1.type === n2.type && n1.key === n2.key
    }

    // 从左端对比
    while (i <= e1 && i <= e2) {

      const n1 = c1[i]
      const n2 = c2[i]

      if (isSomeVNodeType(n1, n2)) {
        // 需要递归 patch， 因为有可能会是 props改变了
        patch(n1, n2, container, parentComponent, parentAnchor)
      } else {
        break
      }
      i++
    }

    // 从右端对比, 跟左端对比逻辑差不多
    while (i <= e1 && i <= e2) {
      const n1 = c1[e1]
      const n2 = c2[e2]

      if (isSomeVNodeType(n1, n2)) {
        patch(n1, n2, container, parentComponent, parentAnchor)
      } else {
        break
      }
      e1--
      e2--
    }

    // 新的比老的多
    if (i > e1) {
      if (i <= e2) {
        const nextPos = e2 + 1
        const anchor = (nextPos < l2) ? c2[nextPos].el : null
        while (i <= e2) {
          patch(null, c2[i], container, parentComponent, anchor)
          i++
        }
      }
    } else if (i > e2) {
      // 新的比老的少
      while (i <= e1) {
        hostRemove(c1[i++].el)
      }
    } else {
      // 中间部分是乱序

      let s1 = i
      let s2 = i
      let patched = 0
      const toBePatched = e2 - s2 + 1

      // 保存映射
      const keyToNewIndexMap = new Map()
      const newIndexToOldIndexMap = new Array(toBePatched)

      // 优化点
      let moved = false
      let maxNewINdexSoFar = 0

      for (let i = 0; i <= e1; i++) {
        newIndexToOldIndexMap[i] = 0
      }


      for (let i = s2; i <= e2; i++) {
        const nextChild = c2[i]

        keyToNewIndexMap.set(nextChild.key, i)
      }

      // 查找复用
      for (let i = s1; i <= e1; i++) {
        let preChild = c1[i]

        if (patched >= toBePatched) {
          hostRemove(preChild.el)
        }
        let newIndex
        if (preChild.key != null) {
          newIndex = keyToNewIndexMap.get(preChild.key)
        } else {
          for (let j = s2; j < e2; j++) {
            if (isSomeVNodeType(preChild, c2[j])) {
              newIndex = j
              break
            }
          }
        }

        if (newIndex === undefined) {
          hostRemove(preChild.el)
        } else {

          if (newIndex >= maxNewINdexSoFar) {
            maxNewINdexSoFar = newIndex
          } else {
            moved = true
          }

          newIndexToOldIndexMap[newIndex - s2] = i + 1
          patch(preChild, c2[newIndex], container, parentComponent, null)
          patched++
        }

      }

      // 获取最长递增自子序列
      const increasingNewSequence = moved ? getSequence(newIndexToOldIndexMap) : []
      let j = increasingNewSequence.length - 1

      for (let i = toBePatched - 1; i >= 0; i--) {

        const nextIndex = i + s2
        const nextChild = c2[nextIndex]
        const anchor = nextIndex + 1 < l2 ? c2[nextIndex + 1].el : null

        if (newIndexToOldIndexMap[i] === 0) {
          // 新创建节点
          patch(null, nextChild, container, parentComponent, anchor)
        } else if (moved) {
          // 移动节点逻辑
          if (j < 0 || i !== increasingNewSequence[j]) {
            console.log('移动')
            hostInsert(nextChild.el, container, anchor)
          } else {
            j--
          }
        }

      }
    }
  }

  function unmountChildren(children) {
    for (let i = 0; i < children.length; i++) {
      const el = children[i].el
      hostRemove(el)
    }
  }


  function setupRenderEffect(instance, initialVnode, container, anchor) {
    // rend 的时候绑定代理对象
    effect(() => {

      // mount
      if (!instance.isMounted) {
        console.log('mount')
        const { proxy } = instance

        const subTree = instance.subTree = instance.render.call(proxy)

        patch(null, subTree, container, instance, anchor)

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

        patch(preSubTree, subTree, container, instance, anchor)

        // initialVnode.el = subTree.el

      }
    })
  }

  return {
    createApp: createAppAPI(render)
  }
}

function getSequence(arr: number[]): number[] {
  const p = arr.slice();
  const result = [0];
  let i, j, u, v, c;
  const len = arr.length;
  for (i = 0; i < len; i++) {
    const arrI = arr[i];
    if (arrI !== 0) {
      j = result[result.length - 1];
      if (arr[j] < arrI) {
        p[i] = j;
        result.push(i);
        continue;
      }
      u = 0;
      v = result.length - 1;
      while (u < v) {
        c = (u + v) >> 1;
        if (arr[result[c]] < arrI) {
          u = c + 1;
        } else {
          v = c;
        }
      }
      if (arrI < arr[result[u]]) {
        if (u > 0) {
          p[i] = result[u - 1];
        }
        result[u] = i;
      }
    }
  }
  u = result.length;
  v = result[u - 1];
  while (u-- > 0) {
    result[u] = v;
    v = p[v];
  }
  return result;
}


'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const Text = Symbol('Text');
const Fragment = Symbol('Fragment');
function createVNode(type, props, children) {
    const vnode = {
        type,
        props,
        children,
        component: null,
        key: props && props.key,
        shapeFlag: getShapeFlag(type),
        el: null
    };
    // 判断 children 是什么类型
    if (typeof children === 'string') {
        vnode.shapeFlag = vnode.shapeFlag | 4 /* ShapeFlags.TEXT_CHILDREN */;
    }
    else if (Array.isArray(children)) {
        vnode.shapeFlag = vnode.shapeFlag | 8 /* ShapeFlags.ARRAY_CHILDREN */;
    }
    if (vnode.shapeFlag & 2 /* ShapeFlags.STATEFUL_COMPOMENT */) {
        if (typeof children === 'object') {
            vnode.shapeFlag |= 16 /* ShapeFlags.SLOT_CHILDREN */;
        }
    }
    return vnode;
}
function createTextVNode(text) {
    return createVNode(Text, {}, text);
}
function getShapeFlag(type) {
    return typeof type === 'string' ? 1 /* ShapeFlags.ELEMENT */ : 2 /* ShapeFlags.STATEFUL_COMPOMENT */;
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

// 渲染插槽
function renderSlots(slots, name, props) {
    const slot = slots[name];
    if (slot) {
        if (typeof slot === 'function') {
            return createVNode(Fragment, {}, slot(props));
        }
    }
}

function isObject(value) {
    return typeof value === 'object';
}
function hasChanged(val, newValue) {
    return !Object.is(val, newValue);
}
function isOn(key) {
    return /^on[A-Z]/.test(key);
}
function hasOwn(target, key) {
    return Object.prototype.hasOwnProperty.call(target, key);
}
// 处理肉串形式 emit-add
const camelize = (str) => {
    return str.replace(/-(\w)/g, (_, c) => {
        return c ? c.toUpperCase() : '';
    });
};
const capitalize = (word) => word.slice(0, 1).toUpperCase() + word.slice(1);
const toHandlerkey = (event) => event ? 'on' + capitalize(event) : '';

let activeEffect; // 当前正在执行的effect
let shouldTrack; // 判断是否需要收集依赖
const targetMap = new Map(); // 收集所有的 target
class ReactiveEffect {
    constructor(cb, scheduler) {
        this.scheduler = scheduler;
        this.deps = [];
        this.active = true;
        this._cb = cb;
        this.scheduler = scheduler;
    }
    run() {
        if (!this.active) {
            return this._cb();
        }
        shouldTrack = true;
        activeEffect = this;
        const res = this._cb();
        // 当函数执行结束后，需要将 当前正在执行的函数重置
        // 不然清空依赖的时候，之前执行的函数依然在，触发get的时候会再次被收集
        shouldTrack = false;
        activeEffect = undefined;
        return res;
    }
    stop() {
        if (this.active) {
            this.deps.forEach((dep) => {
                dep.delete(this);
            });
            this.onStop && this.onStop();
            this.active = false;
        }
    }
}
// 触发 get
function trigger(target, key) {
    const depsMap = targetMap.get(target);
    const dep = depsMap.get(key);
    triggerEffects(dep);
}
function triggerEffects(dep) {
    dep.forEach(cb => {
        // 有 scheduler 就执行 scheduler
        if (cb.scheduler) {
            cb.scheduler();
        }
        else {
            cb.run();
        }
    });
}
function track(target, key) {
    if (!isTracking())
        return;
    // 取出 target 对应的所有 deps
    let depsMap = targetMap.get(target);
    if (!depsMap) {
        depsMap = new Map();
        targetMap.set(target, depsMap);
    }
    // 拿到对应的 dep
    let dep = depsMap.get(key);
    if (!dep) {
        dep = new Set();
        depsMap.set(key, dep);
    }
    trackEffects(dep);
}
function trackEffects(dep) {
    // 如果 dep 中已经存在，就不用收集了
    if (dep.has(activeEffect))
        return;
    dep.add(activeEffect);
    // 反向收集，stop 时候方便清除
    activeEffect.deps.push(dep);
}
// 判断是否需要收集依赖
function isTracking() {
    return shouldTrack && activeEffect !== undefined;
}
function effect(cb, options = {}) {
    const { scheduler, onStop } = options;
    const _effect = new ReactiveEffect(cb, scheduler);
    _effect.onStop = onStop;
    _effect.run();
    const runner = _effect.run.bind(_effect);
    runner.effect = _effect;
    return runner;
}

// 创建 getter ，普通的 getter 和 readonly 的 getter
function createGetter(isReadonly = false, isShallowReadonly = false) {
    return function (target, key) {
        const res = Reflect.get(target, key);
        // 触发 getter 时能够知道这个是一个 readonly 还是一个 observer
        if (key === "_v_isReactive" /* ReactiveFlags.IS_REACTIVE */) {
            return !isReadonly;
        }
        else if (key === "_v_isRaedonly" /* ReactiveFlags.IS_READONLY */) {
            return isReadonly;
        }
        // 如果是 shallowReadonly 直接返回 res
        if (isShallowReadonly) {
            return res;
        }
        if (!isReadonly) {
            // 不是 readonly 就需要收集依赖
            track(target, key);
        }
        // 解决嵌套问题
        if (isObject(res)) {
            return isReadonly ? readonly(res) : reactive(res);
        }
        return res;
    };
}
// 创建 setter
function createSetter() {
    return function (target, key, value) {
        const res = Reflect.set(target, key, value);
        trigger(target, key);
        return res;
    };
}
const set = createSetter();
const get = createGetter();
const readonlyGet = createGetter(true);
const shallowReadonlyGet = createGetter(true, true);
// 可变的 handler
const mutableHandlers = {
    get,
    set
};
// readonly 的 handler
const readonlyHandlers = {
    get: readonlyGet,
    set(target, key, value) {
        console.warn('raadonly 是不允许 set 的');
        return true;
    }
};
const shallowReadonlyHandlers = {
    get: shallowReadonlyGet,
    set(target, key, value) {
        console.warn('raadonly 是不允许 set 的');
        return true;
    }
};

function reactive(raw) {
    return createReactiveObject(raw, mutableHandlers);
}
function readonly(raw) {
    return createReactiveObject(raw, readonlyHandlers);
}
function shallowReadonly(raw) {
    return createReactiveObject(raw, shallowReadonlyHandlers);
}
function createReactiveObject(target, baseHandles) {
    if (!isObject(target)) {
        console.warn(`target ${target} 必须是对象`);
        return;
    }
    return new Proxy(target, baseHandles);
}

class RefImpl {
    constructor(value) {
        this._v_isRef = true;
        // 保存没转换之前的 value
        this.rawValue = value;
        // 处理 ref 是对象的情况
        this._value = convert(value);
        this.dep = new Set();
    }
    get value() {
        // 当需要收集依赖的时候才会 触发 track
        trackRefValue(this);
        return this._value;
    }
    set value(newValue) {
        if (!hasChanged(this.rawValue, newValue))
            return;
        this.rawValue = newValue;
        this._value = convert(newValue);
        triggerEffects(this.dep);
    }
}
function ref(value) {
    return new RefImpl(value);
}
// ref 收集依赖
function trackRefValue(ref) {
    if (isTracking()) {
        trackEffects(ref.dep);
    }
}
// 判断 value 是否是对象，是就需要用 reactive 包裹
function convert(value) {
    return isObject(value) ? reactive(value) : value;
}
function isRef(ref) {
    return !!ref._v_isRef;
}
function unRef(ref) {
    return isRef(ref) ? ref.value : ref;
}
// 能够不用 .value 获取
function proxyRefs(objectWithRefs) {
    return new Proxy(objectWithRefs, {
        get(target, key) {
            return unRef(Reflect.get(target, key));
        },
        set(target, key, value) {
            // 如果当前 target[key] 是一个 ref ，而 value 不是的话
            // 需要将 target[key].value 赋值为 value，其他情况直接替换
            if (isRef(target[key]) && !isRef(value)) {
                return target[key].value = value;
            }
            else {
                return Reflect.set(target, key, value);
            }
        }
    });
}

function emit(instance, event, ...args) {
    const { props } = instance;
    // 处理事件名称
    const handlerName = toHandlerkey(camelize(event));
    const handle = props[handlerName];
    handle && handle(...args);
}

function initProps(instance, rawProps) {
    instance.props = rawProps || {};
}

// 获取 $ 相关的
const publicPropertiesMap = {
    $el: instance => instance.vnode.el,
    $slots: instance => instance.slots,
    $props: instance => instance.props
};
// 代理对象拦截器
const PublicInstanceProxyHandlers = {
    get({ _: instance }, key) {
        const publickGetter = publicPropertiesMap[key];
        if (publickGetter) {
            return publickGetter(instance);
        }
        // 处理 setup 返回的
        const { setupState, props } = instance;
        // if (key in setupState) {
        //   return setupState[key]
        // }
        // 使 this. 能够访问 setup 返回的 和 props
        if (hasOwn(setupState, key)) {
            return setupState[key];
        }
        else if (hasOwn(props, key)) {
            return props[key];
        }
    }
};

function initSlots(instance, children) {
    // instance.slots = Array.isArray(children) ? children : [children]
    const { vnode } = instance;
    if (vnode.shapeFlag & 16 /* ShapeFlags.SLOT_CHILDREN */) {
        normalizeObjectSlots(children, instance.slots);
    }
}
function normalizeObjectSlots(children, slots) {
    for (let key in children) {
        let value = children[key];
        slots[key] = (props) => normalizeSlotValue(value(props));
    }
}
function normalizeSlotValue(value) {
    return Array.isArray(value) ? value : [value];
}

let currentInstance = null; // 当前实例
// 创建实例
function createComponentInstance(vnode, parent) {
    console.log(parent);
    const component = {
        vnode,
        type: vnode.type,
        setupState: {},
        props: {},
        parent,
        next: null,
        emit: () => { },
        slots: {},
        provides: parent ? parent.provides : {},
        isMounted: false,
        subTree: null
    };
    component.emit = emit.bind(null, component);
    return component;
}
// 构建组件
function setupComponent(instance) {
    initProps(instance, instance.vnode.props);
    initSlots(instance, instance.vnode.children);
    setupStatefulComponent(instance);
}
// 构建组件状态
function setupStatefulComponent(instance) {
    const Component = instance.type;
    // 为 instance 增加代理对象
    instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers);
    const { setup } = Component;
    if (setup) {
        setCurrentInstance(instance);
        // 传入 props, 并且把 props 用 shallowReadonly 包裹，因为 props 是不允许修改的
        const setupRes = setup(shallowReadonly(instance.props), {
            emit: instance.emit
        });
        setCurrentInstance(null);
        handleSetupRes(instance, setupRes);
    }
}
// 处理组件的 setup 的结果
function handleSetupRes(instance, setupRes) {
    if (typeof setupRes === 'object') {
        instance.setupState = proxyRefs(setupRes);
    }
    finishComponentSetup(instance);
}
function finishComponentSetup(instance) {
    const Component = instance.type;
    if (Component.render) {
        instance.render = Component.render;
    }
}
function getCurrentInstance() {
    return currentInstance;
}
function setCurrentInstance(newInstance) {
    currentInstance = newInstance;
}

function provide(key, value) {
    // 获取当前实例
    const currentInstance = getCurrentInstance();
    // 给当前 instance 上挂属性
    if (currentInstance) {
        let { provides } = currentInstance;
        // 当前组件如果需要使用 provide ，就不能直接用父级的了，需要自己创建
        const parentProvides = currentInstance.parent.provides;
        // init, 因为在初始化 provides 的时候是赋值的 parent.provides
        if (provides === parentProvides) {
            // 利用原型链
            provides = currentInstance.provides = Object.create(parentProvides);
        }
        provides[key] = value;
    }
}
// inject 支持默认值，支持默认值是函数
function inject(key, defaultValue) {
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        const parentProvides = currentInstance.parent.provides;
        // 查找 key
        if (key in parentProvides) {
            return parentProvides[key];
        }
        else if (defaultValue) {
            // 判断默认值是否是 函数
            if (typeof defaultValue === 'function') {
                return defaultValue();
            }
            return defaultValue;
        }
        return parentProvides[key];
    }
}

function shouldUpdateComponent(preVNode, nextVNode) {
    const { props: preProps } = preVNode;
    const { props: nextProps } = nextVNode;
    for (let key in nextProps) {
        if (nextProps[key] !== preProps[key]) {
            return true;
        }
    }
    return false;
}

// 1 创建 App
function createAppAPI(render) {
    return function createApp(rootComponent) {
        return {
            // 2 挂载
            mount(rootContainer) {
                // 3 创建虚拟节点
                const vnode = createVNode(rootComponent);
                // 4 渲染到容器上
                render(vnode, createContainer(rootContainer));
            }
        };
    };
    function createContainer(container) {
        if (typeof container === 'string') {
            return document.querySelector(container);
        }
        return container;
    }
}

const queue = [];
let isFlushPedding = false;
function queueJobs(job) {
    if (!queue.includes(job)) {
        queue.push(job);
    }
    queueFlush();
}
function queueFlush() {
    if (isFlushPedding)
        return;
    isFlushPedding = true;
    Promise.resolve().then(() => {
        isFlushPedding = false;
        let job;
        while ((job = queue.shift())) {
            job && job();
        }
    });
}

function createRenderer(options) {
    const { createElement: hostCreateElement, patchProp: hostPatchProp, insert: hostInsert, remove: hostRemove, setElementText: hostSetElementText } = options;
    function render(vnode, container) {
        // 执行patch
        patch(null, vnode, container, null, null);
    }
    function patch(n1, n2, container, parentComponent, anchor) {
        // 判断 vnode 时 component 还是 element，并执行对应的处理逻辑
        // shapeFlags
        const { shapeFlag, type } = n2;
        switch (type) {
            case Fragment:
                processFragment(n1, n2, container, parentComponent, anchor);
                break;
            case Text:
                processText(n1, n2, container);
                break;
            default:
                if (shapeFlag & 1 /* ShapeFlags.ELEMENT */) {
                    processElement(n1, n2, container, parentComponent, anchor);
                }
                else if (shapeFlag & 2 /* ShapeFlags.STATEFUL_COMPOMENT */) {
                    processComponent(n1, n2, container, parentComponent, anchor);
                }
                break;
        }
    }
    // 处理 component
    function processComponent(n1, n2, container, parentComponent, anchor) {
        if (!n1) {
            // 组件挂载
            mountComponent(n2, container, parentComponent, anchor);
        }
        else {
            // 组件更新
            updateComponent(n1, n2);
        }
    }
    function updateComponent(n1, n2) {
        const instance = n2.component = n1.component;
        if (shouldUpdateComponent(n1, n2)) {
            instance.next = n2;
            instance.update();
        }
        else {
            n2.el = n1.el;
            instance.vnode = n2;
        }
    }
    // 处理元素
    function processElement(n1, n2, container, parentComponent, anchor) {
        // 判断是更新还是挂载
        if (!n1) {
            mountElement(n2, container, parentComponent, anchor);
        }
        else {
            patchElement(n1, n2, container, parentComponent, anchor);
        }
    }
    // 处理 片段
    function processFragment(n1, n2, container, parentComponent, anchor) {
        mountChildren(n2.children, container, parentComponent, anchor);
    }
    // 处理文本
    function processText(n1, n2, container) {
        const { children } = n2;
        const textNode = n2.el = document.createTextNode(children);
        container.append(textNode);
    }
    // 挂载组件
    function mountComponent(initialVnode, container, parentComponent, anchor) {
        // 创建实例
        const instance = initialVnode.component = createComponentInstance(initialVnode, parentComponent); // {vnode: vnode, type: vnode.type}
        setupComponent(instance);
        setupRenderEffect(instance, initialVnode, container, anchor);
    }
    // 挂载元素
    function mountElement(vnode, container, parentComponent, anchor) {
        const el = vnode.el = hostCreateElement(vnode.type);
        const { children } = vnode;
        // 判断 childre 是否是数组
        if (typeof children === 'string') {
            el.textContent = vnode.children;
        }
        else if (Array.isArray(children)) {
            // children.forEach(v => patch(v, el))
            mountChildren(children, el, parentComponent, anchor);
        }
        const { props } = vnode;
        for (let key in props) {
            const value = props[key];
            // 判断是否是需要注册事件
            // if (isOn(key)) {
            //   const event = key.slice(2).toLowerCase()
            //   el.addEventListener(event, value)
            // } else {
            //   el.setAttribute(key, value)
            // }
            hostPatchProp(el, key, null, value);
        }
        // container.append(el)
        hostInsert(el, container, anchor);
    }
    // 挂载子级
    function mountChildren(children, container, parentComponent, anchor) {
        children.forEach(v => patch(null, v, container, parentComponent, anchor));
    }
    // 更新element流程
    function patchElement(n1, n2, container, parentComponent, anchor) {
        console.log('patchElement');
        console.log('n1', n1);
        console.log('n2', n2);
        const oldProps = n1.props || EMPTY_OBJ;
        const newProps = n2.props || EMPTY_OBJ;
        const el = (n2.el = n1.el);
        patchChildren(n1, n2, el, parentComponent, anchor);
        patchProps(el, oldProps, newProps);
    }
    const EMPTY_OBJ = {}; // 初始化 props
    // 更新 props
    function patchProps(el, oldProps, newProps) {
        // 只有当新旧 props 不一样才 进行 patch
        if (oldProps !== newProps) {
            for (let key in newProps) {
                const preProp = oldProps[key];
                const newProp = newProps[key];
                if (preProp !== newProp) {
                    hostPatchProp(el, key, preProp, newProp);
                }
                // 貌似没必要 判断
                if (oldProps !== EMPTY_OBJ) {
                    for (let key in oldProps) {
                        console.log(key, oldProps, newProp);
                        if (!(key in newProps)) {
                            hostPatchProp(el, key, oldProps[key], null);
                        }
                    }
                }
            }
        }
    }
    function patchChildren(n1, n2, container, parentComponent, anchor) {
        const preShapeFlag = n1.shapeFlag;
        const c1 = n1.children;
        const { shapeFlag } = n2;
        const c2 = n2.children;
        // Array2Text
        if (shapeFlag & 4 /* ShapeFlags.TEXT_CHILDREN */) {
            if (preShapeFlag & 8 /* ShapeFlags.ARRAY_CHILDREN */) {
                // 移除所有 child
                unmountChildren(n1.children);
            }
            // 设置新的 textChild (Text2Text)
            if (c1 !== c2) {
                hostSetElementText(container, c2);
            }
        }
        else {
            // Text2Array
            if (preShapeFlag & 4 /* ShapeFlags.TEXT_CHILDREN */) {
                // 清空文本
                hostSetElementText(container, '');
                mountChildren(c2, container, parentComponent, anchor);
            }
            else {
                // 处理 Array2Array， 采用双端对比算法
                patchKeyedChildren(c1, c2, container, parentComponent, anchor);
            }
        }
    }
    function patchKeyedChildren(c1, c2, container, parentComponent, parentAnchor) {
        const l2 = c2.length;
        let i = 0;
        let e1 = c1.length - 1;
        let e2 = l2 - 1;
        // 判断是否是相同的节点
        function isSomeVNodeType(n1, n2) {
            return n1.type === n2.type && n1.key === n2.key;
        }
        // 从左端对比
        while (i <= e1 && i <= e2) {
            const n1 = c1[i];
            const n2 = c2[i];
            if (isSomeVNodeType(n1, n2)) {
                // 需要递归 patch， 因为有可能会是 props改变了
                patch(n1, n2, container, parentComponent, parentAnchor);
            }
            else {
                break;
            }
            i++;
        }
        // 从右端对比, 跟左端对比逻辑差不多
        while (i <= e1 && i <= e2) {
            const n1 = c1[e1];
            const n2 = c2[e2];
            if (isSomeVNodeType(n1, n2)) {
                patch(n1, n2, container, parentComponent, parentAnchor);
            }
            else {
                break;
            }
            e1--;
            e2--;
        }
        // 新的比老的多
        if (i > e1) {
            if (i <= e2) {
                const nextPos = e2 + 1;
                const anchor = (nextPos < l2) ? c2[nextPos].el : null;
                while (i <= e2) {
                    patch(null, c2[i], container, parentComponent, anchor);
                    i++;
                }
            }
        }
        else if (i > e2) {
            // 新的比老的少
            while (i <= e1) {
                hostRemove(c1[i++].el);
            }
        }
        else {
            // 中间部分是乱序
            let s1 = i;
            let s2 = i;
            let patched = 0;
            const toBePatched = e2 - s2 + 1;
            // 保存映射
            const keyToNewIndexMap = new Map();
            const newIndexToOldIndexMap = new Array(toBePatched);
            // 优化点
            let moved = false;
            let maxNewINdexSoFar = 0;
            for (let i = 0; i <= e1; i++) {
                newIndexToOldIndexMap[i] = 0;
            }
            for (let i = s2; i <= e2; i++) {
                const nextChild = c2[i];
                keyToNewIndexMap.set(nextChild.key, i);
            }
            // 查找复用
            for (let i = s1; i <= e1; i++) {
                let preChild = c1[i];
                if (patched >= toBePatched) {
                    hostRemove(preChild.el);
                }
                let newIndex;
                if (preChild.key != null) {
                    newIndex = keyToNewIndexMap.get(preChild.key);
                }
                else {
                    for (let j = s2; j <= e2; j++) {
                        if (isSomeVNodeType(preChild, c2[j])) {
                            newIndex = j;
                            break;
                        }
                    }
                }
                if (newIndex === undefined) {
                    hostRemove(preChild.el);
                }
                else {
                    if (newIndex >= maxNewINdexSoFar) {
                        maxNewINdexSoFar = newIndex;
                    }
                    else {
                        moved = true;
                    }
                    newIndexToOldIndexMap[newIndex - s2] = i + 1;
                    patch(preChild, c2[newIndex], container, parentComponent, null);
                    patched++;
                }
            }
            // 获取最长递增自子序列
            const increasingNewSequence = moved ? getSequence(newIndexToOldIndexMap) : [];
            let j = increasingNewSequence.length - 1;
            for (let i = toBePatched - 1; i >= 0; i--) {
                const nextIndex = i + s2;
                const nextChild = c2[nextIndex];
                const anchor = nextIndex + 1 < l2 ? c2[nextIndex + 1].el : null;
                if (newIndexToOldIndexMap[i] === 0) {
                    // 新创建节点
                    patch(null, nextChild, container, parentComponent, anchor);
                }
                else if (moved) {
                    // 移动节点逻辑
                    if (j < 0 || i !== increasingNewSequence[j]) {
                        console.log('移动');
                        hostInsert(nextChild.el, container, anchor);
                    }
                    else {
                        j--;
                    }
                }
            }
        }
    }
    function unmountChildren(children) {
        for (let i = 0; i < children.length; i++) {
            const el = children[i].el;
            hostRemove(el);
        }
    }
    function setupRenderEffect(instance, initialVnode, container, anchor) {
        // rend 的时候绑定代理对象
        instance.update = effect(() => {
            // mount
            if (!instance.isMounted) {
                console.log('mount');
                const { proxy } = instance;
                const subTree = instance.subTree = instance.render.call(proxy);
                patch(null, subTree, container, instance, anchor);
                initialVnode.el = subTree.el;
                instance.isMounted = true;
            }
            else {
                // update
                console.log('update');
                const { next, vnode } = instance;
                if (next) {
                    next.el = vnode.el;
                    updateComponentProRender(instance, next);
                }
                const { proxy } = instance;
                const subTree = instance.render.call(proxy);
                const preSubTree = instance.subTree;
                instance.subTree = subTree;
                // console.log(subTree)
                // console.log(preSubTree)
                patch(preSubTree, subTree, container, instance, anchor);
                // initialVnode.el = subTree.el
            }
        }, {
            scheduler() {
                queueJobs(instance.update);
            }
        });
    }
    return {
        createApp: createAppAPI(render)
    };
}
function updateComponentProRender(instance, nextVNode) {
    instance.vnode = nextVNode;
    instance.props = nextVNode.props;
    instance.next = null;
}
function getSequence(arr) {
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
                }
                else {
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

function createElement(type) {
    return document.createElement(type);
}
// 设置 props
function patchProp(el, key, preVal, nextVal) {
    if (isOn(key)) {
        const event = key.slice(2).toLowerCase();
        el.addEventListener(event, nextVal);
    }
    else {
        // 当新的值是 null | undefined, 就删除
        if (nextVal == null) {
            el.removeAttribute(key);
        }
        else {
            el.setAttribute(key, nextVal);
        }
    }
}
// 插入元素
function insert(child, container, anchor) {
    // container.append(el)
    container.insertBefore(child, anchor || null);
}
// 移除元素
function remove(child) {
    // 获取要删除元素的父级
    const parent = child.parentNode;
    if (parent) {
        parent.removeChild(child);
    }
}
// 设置文本元素
function setElementText(container, text) {
    container.textContent = text;
}
const renderer = createRenderer({
    createElement,
    patchProp,
    insert,
    remove,
    setElementText
});
function createApp(...args) {
    return renderer.createApp(...args);
}

exports.createApp = createApp;
exports.createRenderer = createRenderer;
exports.createTextVNode = createTextVNode;
exports.getCurrentInstance = getCurrentInstance;
exports.h = h;
exports.inject = inject;
exports.provide = provide;
exports.ref = ref;
exports.renderSlots = renderSlots;

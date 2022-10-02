const Text = Symbol('Text');
const Fragment = Symbol('Fragment');
function createVNode(type, props, children) {
    const vnode = {
        type,
        props,
        children,
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

function isObject(value) {
    return typeof value === 'object';
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

const targetMap = new Map(); // 收集所有的 target
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
    $slots: instance => instance.slots
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
        emit: () => { },
        slots: {},
        provides: parent ? parent.provides : {}
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
        instance.setupState = setupRes;
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

function render(vnode, container) {
    // 执行patch
    patch(vnode, container, null);
}
function patch(vnode, container, parentComponent) {
    // 判断 vnode 时 component 还是 element，并执行对应的处理逻辑
    // shapeFlags
    const { shapeFlag, type } = vnode;
    switch (type) {
        case Fragment:
            processFragment(vnode, container, parentComponent);
            break;
        case Text:
            processText(vnode, container);
            break;
        default:
            if (shapeFlag & 1 /* ShapeFlags.ELEMENT */) {
                processElement(vnode, container, parentComponent);
            }
            else if (shapeFlag & 2 /* ShapeFlags.STATEFUL_COMPOMENT */) {
                processComponent(vnode, container, parentComponent);
            }
            break;
    }
}
// 处理 component
function processComponent(vnode, container, parentComponent) {
    mountComponent(vnode, container, parentComponent);
}
function processElement(vnode, container, parentComponent) {
    mountElement(vnode, container, parentComponent);
}
function processFragment(vnode, container, parentComponent) {
    mountChildren(vnode.children, container, parentComponent);
}
function processText(vnode, container) {
    const { children } = vnode;
    const textNode = vnode.el = document.createTextNode(children);
    container.append(textNode);
}
// 挂载组件
function mountComponent(initialVnode, container, parentComponent) {
    // 创建实例
    const instance = createComponentInstance(initialVnode, parentComponent); // {vnode: vnode, type: vnode.type}
    setupComponent(instance);
    setupRenderEffect(instance, initialVnode, container);
}
function mountElement(vnode, container, parentComponent) {
    const el = vnode.el = document.createElement(vnode.type);
    const { children } = vnode;
    // 判断 childre 是否是数组
    if (typeof children === 'string') {
        el.textContent = vnode.children;
    }
    else if (Array.isArray(children)) {
        // children.forEach(v => patch(v, el))
        mountChildren(children, el, parentComponent);
    }
    const { props } = vnode;
    for (let key in props) {
        const value = props[key];
        // 判断是否是需要注册事件
        if (isOn(key)) {
            const event = key.slice(2).toLowerCase();
            el.addEventListener(event, value);
        }
        else {
            el.setAttribute(key, value);
        }
    }
    container.append(el);
}
function mountChildren(children, container, parentComponent) {
    children.forEach(v => patch(v, container, parentComponent));
}
function setupRenderEffect(instance, initialVnode, container) {
    // rend 的时候绑定代理对象
    const { proxy } = instance;
    const subTree = instance.render.call(proxy);
    patch(subTree, container, instance);
    initialVnode.el = subTree.el;
}

// 1 创建 App
function createApp(rootComponent) {
    return {
        // 2 挂载
        mount(rootContainer) {
            // 3 创建虚拟节点
            const vnode = createVNode(rootComponent);
            // 4 渲染到容器上
            render(vnode, createContainer(rootContainer));
        }
    };
}
function createContainer(container) {
    if (typeof container === 'string') {
        return document.querySelector(container);
    }
    return container;
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

function renderSlots(slots, name, props) {
    const slot = slots[name];
    if (slot) {
        if (typeof slot === 'function') {
            return createVNode(Fragment, {}, slot(props));
        }
    }
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

export { createApp, createTextVNode, getCurrentInstance, h, inject, provide, renderSlots };

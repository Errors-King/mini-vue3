'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function createVNode(type, props, children) {
    const vnode = {
        type,
        props,
        children,
        el: null
    };
    return vnode;
}

function isObject(value) {
    return typeof value === 'object';
}

const publicPropertiesMap = {
    $el: instance => instance.vnode.el
};
const PublicInstanceProxyHandlers = {
    get({ _: instance }, key) {
        const publickGetter = publicPropertiesMap[key];
        if (publickGetter) {
            return publickGetter(instance);
        }
        const { setupState } = instance;
        if (key in setupState) {
            return setupState[key];
        }
    }
};

// 创建实例
function createComponentInstance(vnode) {
    const component = {
        vnode,
        type: vnode.type,
        setupState: {}
    };
    return component;
}
// 构建组件
function setupComponent(instance) {
    // initProps()
    // initSlots()
    setupStatefulComponent(instance);
}
// 构建组件状态
function setupStatefulComponent(instance) {
    const Component = instance.type;
    // 为 instance 增加代理对象
    instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers);
    const { setup } = Component;
    if (setup) {
        const setupRes = setup();
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

function render(vnode, container) {
    // 执行patch
    patch(vnode, container);
}
function patch(vnode, container) {
    // 判断 vnode 时 component 还是 element，并执行对应的处理逻辑
    if (typeof vnode.type === 'string') {
        processElement(vnode, container);
    }
    else if (isObject(vnode.type)) {
        processComponent(vnode, container);
    }
}
function processElement(vnode, container) {
    mountElement(vnode, container);
}
function mountElement(vnode, container) {
    const el = vnode.el = document.createElement(vnode.type);
    const { children } = vnode;
    // 判断 childre 是否是数组
    if (typeof children === 'string') {
        el.textContent = vnode.children;
    }
    else if (Array.isArray(children)) {
        // children.forEach(v => patch(v, el))
        mountChildren(children, el);
    }
    const { props } = vnode;
    for (let key in props) {
        const value = props[key];
        el.setAttribute(key, value);
    }
    container.append(el);
}
function mountChildren(children, container) {
    children.forEach(v => patch(v, container));
}
// 处理 component
function processComponent(vnode, container) {
    mountComponent(vnode, container);
}
// 挂载组件
function mountComponent(initialVnode, container) {
    // 创建实例
    const instance = createComponentInstance(initialVnode); // {vnode: vnode, type: vnode.type}
    setupComponent(instance);
    setupRenderEffect(instance, initialVnode, container);
}
function setupRenderEffect(instance, initialVnode, container) {
    // rend 的时候绑定代理对象
    const { proxy } = instance;
    const subTree = instance.render.call(proxy);
    patch(subTree, container);
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

exports.createApp = createApp;
exports.h = h;

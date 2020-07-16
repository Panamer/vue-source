import Watcher from './observer/watcher';
import { patch } from './vdom/patch';
export function lifeCycleMixin(Vue) {
    Vue.prototype._update = function (vnode) {
        const vm = this;

        // 将虚拟节点 变成 真实节点 替换掉$el

        // 后续 dom diff 也会执行此方法


        vm.$el = patch(vm.$el, vnode);

    }
}
export function mountComponent(vm, el) {
    // vue在渲染的过程中 会创建一个 所谓的渲染watcher 只用来渲染的
    // watcher 就是一个回调 每次数据变化 就会重新执行watcher
    // vue 不是纯粹的 MVVM 框架
    callHook(vm, 'beforeMount')
    function updateComponent() {
        console.log('updateComponent');
        vm._update(vm._render())
    }

    new Watcher(vm, updateComponent, () => { }, true);

    callHook(vm, 'mounted')
}


export function callHook(vm, hook) { // vm.$options
    let handlers = vm.$options[hook]; // 典型的发布订阅模式
    if (handlers) {
        for (let i = 0; i < handlers.length; i++) { // [fn,fn,fn]
            handlers[i].call(vm); // 所有的生命周期的this 指向的都是当前的实例
        }
    }
}
import Watcher from './observer/watcher';
import { patch } from './vdom/patch';
export function lifeCycleMixin(Vue) {
    Vue.prototype._update = function(vnode){
        // 传入vnode 得到真实dom  挂在vm.$el 上
        const vm = this;
        vm.$el = patch(vm.$el, vnode)
    }
}
export function mountComponent(vm, el) {

    callHook(vm, 'beforeMount')

    function updateComponent(){
        vm._update(vm._render())
    }
    new Watcher(vm, updateComponent, ()=>{}, true)

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
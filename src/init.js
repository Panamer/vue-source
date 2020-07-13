import { initState } from './state'
export function initMixin(Vue) {
    Vue.prototype._init = function (options) {

        const vm = this;
        // Vue 内的$options 就是用户传入的所有参数
        vm.$options = options

        // 初始化状态
        initState(vm)

    }
}
import { initState } from './state'
import { compileToFunctions } from './compiler/index.js'
import { mountComponent, callHook } from './lifecycle.js'
export function initMixin(Vue) {
    Vue.prototype._init = function (options) {

        const vm = this;
        // Vue 内的$options 就是用户传入的所有参数
        vm.$options = options
        callHook(vm, 'beforeCreate')
        // 初始化状态
        initState(vm)
        
        callHook(vm, 'created')

        // 根据模版进行渲染, 用户传入了el属性才执行挂载 $mount  否则要手动 
        if (vm.$options.el) {
            vm.$mount(vm.$options.el)
        }
    }
    /**
     * 传入的el可以是字符串 也可以是dom对象. 这里默认是string 源码中有判断 typeof el === 'string'
     * 详见 171页
     * 三者的优先级:  render > template > el
     */
    Vue.prototype.$mount = function (el) {
        const vm = this;
        el = vm.$el = document.querySelector(el)
        // 如果render不存在 将模版编译成render函数 赋值给$options.render
        const opts = vm.$options
        if (!opts.render) {
            let template = opts.template
            if (!template && el) {
                template = el.outerHTML;
            }
            const render = compileToFunctions(template)
            opts.render = render;
        }

        // render存在 就不需要编译了 用户传入了一个render
        // 挂载即可
        mountComponent(vm, el)
    }
}
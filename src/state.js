import { observe } from './observer/index'
export function initState(vm) {
    const opts = vm.$options

    if (opts.props) {
        initProps(vm)
    }
    if (opts.methods) {
        initMethod(vm)
    }
    if (opts.data) {
        initData(vm)
    }

    function initProps(vm) {

    }
    function initMethod(vm) {

    }
    function initData(vm) {
        // 这里就是如何做数据响应式的源码,首先拿到用户传入的数据
        let data = vm.$options.data;

        if (typeof data === 'function') {
            data = vm._data = data.call(vm)
        } else {
            data = vm._data = data
        }

        // 把数据代理到vm实例上, 方便取的时候直接可以 vm.msg
        for (const key in data) {
            if (data.hasOwnProperty(key)) {
                proxy(vm, '_data', key)                
            }
        }
        // 观测数据
        observe(data)
    }

    function proxy(target, property, key){
        Object.defineProperty(target, key, {
            get(){
                return target[property][key]
            },
            set(newVal){
                target[property][key] = newVal
            }
        })
    }
}

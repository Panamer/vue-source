import { pushTarget, popTarget } from "./dep";
import { queueWatcher } from "./scheduler";
import { callHook } from "../lifecycle";

// 每一个watcher都有一个id 代表着watcher的唯一性
// 目前写到这 只有一个渲染watcher  只要模版中用到了这个属性 当属性变化了 就更新视图
// watcher可以看成是个回调函数
let id = 0;
class Watcher {
    constructor(vm, exprOrFn, cb, options) {
        this.vm = vm;
        this.exprOrFn = exprOrFn;
        this.cb = cb;
        this.options = options;
        this.deps = [];
        this.depsId = new Set();
        this.id = id++;
        if (typeof exprOrFn === 'function') {
            this.getter = exprOrFn
        }
        this.get()
    }
    // new Watcher的时候先把渲染watcher实例 存在 Dep.target上
    // this.getter() 就是要渲染页面 必将defineProperty取值 
    // 此时我就可以拿到全局的Dep.target 
    // 每一个属性都有一个dep 取值就是将Dep.target 和 dep 双向记忆
    // 数据变化 通知watcher更新
    get(){
        pushTarget(this)
        this.getter()
        popTarget()
    }
    // 属性的get方法被拦截 执行dep.depend() 其实是Dep.target.addDep(this)
    // 把dep传给watcher了  然后两者双向记忆 去重
    addDep(dep){
        if (!this.depsId.has(dep.id)) {
            this.depsId.add(dep.id)
            this.deps.push(dep)
            dep.addSub(this) // 让当前dep 订阅这个watcher
        }
    }
    // 虽然更新 但我是异步更新 所以把watcher先放进去 没有马上执行
    update(){
        queueWatcher(this)
    }
    // 写一个备用的run方法 供异步更新使用
    // this.get() 会导致页面重新渲染
    run(){
        this.get()
    }
}


export default Watcher

/**
 * 组件mount的时候 会 new Watcher 一个实例  第二个参数是updateComponent 更新函数
 * new Watcher 里会执行 来自于Dep的 pushTarget(this) this就是watcher实例
 * 这里太巧妙了  执行watcher的时候 却在 操作dep 把watcher赋给Dep.target 并存起来
 *
 * 当属性 get被调用的时候 dep.depend 再把当前可以对应的dep属性 存到watcher里  Dep.target.addDep
 *
 */
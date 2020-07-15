import { pushTarget, popTarget } from "./dep";
import { queueWatcher } from "./scheduler";

let id = 0; // 做一个watcher 的id 每次创建watcher时 都有一个序号 
// 目前写到这里 只有一个watcher 渲染watchrer，只要视图中使用到了这个属性，而且属性变化了就要更新视图

class Watcher {
    constructor(vm, exprOrFn, cb, options) {
        this.vm = vm;
        this.exprOrFn = exprOrFn;
        this.cb = cb;
        this.options = options
        this.deps = []
        this.depsId = new set()
        if (typeof exprOrFn === 'function') {
            this.getter = exprOrFn
        }
        this.id = id++
        this.get()
    }
    run(){
        this.get()
    }
    get(){
        pushTarget(this)
        this.getter()
        popTarget()
    }
    addDep(dep){
        let id = dep.id
        if (!this.depsId.has(id)) {
            this.depsId.add(id)
            this.deps.push(dep);
            dep.addSub(this)
        }
    }
    update(){
        queueWatcher(this)
    }
}


export default Watcher
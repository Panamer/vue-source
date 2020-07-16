// 每个dep也有一个自己的id 和watcher一样
// dep和watcher是 多对多的关系 
// 每个key对应一个dep 一个dep可能存着多个watcher 一个watcher也可能被多个属性所依赖
let id = 0;
class Dep{
    constructor(){
        this.id = id++;
        this.subs = []
    }
    // 对象的属性被访问  会执行 new Dep 然后 dep.depend  这个时候Dep.target上已经有实例了
    // 表面上是调用了dep的方法  其实是在操作 watcher 
    // 让watcher记忆dep  dep记忆watcher 双向记忆
    // 先是watcher存dep  再是调用dep的addSub方法 存watcher  而且有去重在里面 秒
    depend(){
        Dep.target.addDep(this)
    }
    addSub(watcher){
        this.subs.push(watcher)
    }
    notify(){
        this.subs.forEach(watcher => watcher.update())
    }
}
// 初始化是null
Dep.target = null;

const stack = [];
// 把watcher存储到全局
export function pushTarget(watcher){
    Dep.target = watcher
    stack.push(watcher)
}
// 删除watcher
export function popTarget(){
    stack.pop()
    Dep.target = stack[stack.length - 1]
}

export default Dep;
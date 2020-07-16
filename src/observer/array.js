/**
 * 对数组的7个方法做函数劫持, 为什么是这7个呢? 因为只有他们能改变数组本身
 * ⚠️ 在实际应用中 操作数组索引改变数组 vue是检测不到的  list[0] = 100 ❌
 * 原理: 复制数组原型上的方法 对其中7个做函数劫持 AOP
 * 先执行自定义方法 再触发原型上的方法 apply 
 */

let oldArrayMethods = Array.prototype;  // 获取数组原型上的方法

// 创建一个全新的对象, 根据原型链可以找到数组原型上的方法, 而且拓展方法时 不会影响原数组的原型方法
export let arrayMethods = Object.create(oldArrayMethods)

let methods = [
    'push',
    'pop',
    'unshift',
    'shift',
    'splice',
    'sort',
    'reserve'
]

methods.forEach(method => {
    arrayMethods[method] = function (...args) {
        const ob = this.__ob__
        let result = oldArrayMethods[method].apply(this, args)
        let inserted;
        switch (method) {
            case 'push':
            case 'unshift':
                inserted = args
                break;
            case 'splice':
                inserted = args.slice(2);
                break;
            default:
                break;
        }
        inserted && ob.observeArray(inserted)
        console.log('数组被观测了', inserted);
        // 数组的依赖更新
        ob.dep.notify()
        return result;
    }
})
/**
 * 为什么7个方法 只对三个做了处理呢?
 * 因为 push、unshift、splice  可以新增属性. 其他几个不能新增
 * 做响应式处理的目标是对所有数据观测, 所以不是新增的数据 不用处理.虽然其他的方法也能让数组改变
 * 注意: 这一步只做观测, 使页面更新的是  触发依赖 不要混淆.
 * 观测和页面更新没有直接关系,观测是为收集、触发依赖做铺垫
 */
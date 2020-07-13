import { arrayMethods } from "./array";
import {isObject} from '../utils.js'

/**
 * 为什么vue用function 这里用class? 
 * 因为 Function构造函数方便扩展原型上的属性和方法, 这里不需要
 */
class Observe {
    constructor(data) {
        /**
         * 1、添加一个__ob__响应式标示,代表data已经被观测过, 对象数组都有
         * 2、data.__ob__  = this
         * 在数据上就可以获取到ob属性, 指代的是 observe实例
         */
        Object.defineProperty(data, '__ob__', {
            enumerable: false,
            configurable: false,
            value: this
        })
        /**
         * 因为实际开发中通过索引操作数组的情况并不多, 如果这里通过拦截数组的索引 做响应式太浪费性能
         * 所以 vue采用 函数劫持的方法 重写了 7个能改变数组本身的方法
         * 这里判断一下是 对象 or 数组
         * 利用原型链向上查找的特性,使得数组改变的方法从arrayMethods中取到
         */
        if (Array.isArray(data)) {
            data.__proto__ = arrayMethods;
            this.observeArray(data)
        } else {
            this.walk(data)
        }
    }
    /**
     * 无论数组还是对象, 都要遍历其中的每一项 做响应式处理
     */
    observeArray(data) {
        for (let i = 0; i < data.length; i++) {
            observe(data[i]);
        }
    }
    walk(data) {
        Object.keys(data).forEach((key) => {
            defineReactive(data, key, data[key])
        })
    }

}

/**
 * vue2.0 有性能问题: 递归重写get set 数据嵌套很大的话 性能很差. vue3 使用proxy得到优化🐂
 * 
 */

function defineReactive(data, key, value) {
    observe(value) // value可能还是一个对象 递归循环检测一下
    Object.defineProperty(data, key, {
        get() {
            console.log('get----');
            return value
        },
        set(newVal) {
            if (newVal === value) return
            observe(newVal)
            value = newVal
        }
    })
}


export function observe(data) {
    // 如果不是对象 就不用做响应式处理
    if (isObject(data)) {
        return;
    }
    // 如果有__ob__属性    表示观测过 也直接跳出
    if (data.__ob__ instanceof Observe) {
        return;
    }
    // 返回一个observe实例, 观测的核心代码在这里, 一个对象 对应一个ob实例 
    return new Observe(data)
}
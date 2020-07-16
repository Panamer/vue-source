/**
 * vue使用的是rollup打包 它的特点是把多个小模块 组合成复杂的逻辑
 * rollup更专注于打包javascript类库
 * 开发应用的时候更推荐用webpack, 开发库时用rollup
 */
import { initMixin } from './init'
import { renderMixin } from './render.js'
import { lifeCycleMixin } from './lifecycle.js'
import {initGlobalAPI} from './global-api/index.js'
import {nextTick} from './observer/scheduler'

function Vue(options) {
    // 内部要进行初始化操作
    this._init(options)
}

// 由于组件初始化 会有很多方法 在这里写一堆 Vue.prototype.methods 不优雅
// 所以使用混入 更好 通过mixin引入

// 在原型上添加属性或方法
initMixin(Vue)  // initState $mount 
renderMixin(Vue)    // vm._render
lifeCycleMixin(Vue) // _update


// 给构造函数扩展全局的方法
initGlobalAPI(Vue)
Vue.prototype.$nextTick = nextTick



export default Vue
# vue-source
最简单易懂完整的源码简化版

### master分支
第一版 完整版


### gyw-sourse
第二版: 学习vue2.0源码很久了,打算自己敲一下.然后2.0告一段落 进入3.0进阶

```
vue 完整版、 只包含运行时版本  两者的差异: 有无编译器 compile 
我们使用的是runtimeOnly版本  因为 vue-loader已经对模版处理了 得到的是render函数  render函数返回的是虚拟dom
注意: 只包含运行时版本 不能使用template. 

虚拟dom的作用是: 
维护视图和状态的关系
复杂视图情况下提升渲染性能
跨平台(除了渲染真实dom以外 还可以实现SSR 小程序 RN)

响应式原理:
vue构造函数内部有一个 _init方法, 是在new Vue后做初始化用的,包含
initLifecycle
initEvents
initRender
callHook(vm, 'beforeCreate)
initInjections(vm)
initState(vm)
initProvide(vm)
callHook(vm, 'created')

initState里有个observe, 处理对象、数组的响应式
处理对象的方式: 利用Object.defineProperty 重新定义get set 拦截对象上的所以属性 达到观测的目的
处理数组的方式: 利用函数劫持的特性 对数组的7个方法进行重写 数组新增时可以被观测到

下面在数据响应式的基础上  收集依赖  触发依赖  更新视图  达到数据变化 视图自动更新的目的


模版编译: 解析器、优化器、代码生成器               render返回vnode 虚拟节点
把字符串模版转换成render函数经历了哪些步骤? 
1、实现一个解析器, 生成ATS: 用树结构描述标签语法(不同于vnode: 用js对象描述html)

```
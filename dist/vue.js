(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.Vue = factory());
}(this, (function () { 'use strict';

  function _typeof(obj) {
    "@babel/helpers - typeof";

    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  /**
   * 对数组的7个方法做函数劫持, 为什么是这7个呢? 因为只有他们能改变数组本身
   * ⚠️ 在实际应用中 操作数组索引改变数组 vue是检测不到的  list[0] = 100 ❌
   * 原理: 复制数组原型上的方法 对其中7个做函数劫持 AOP
   * 先执行自定义方法 再触发原型上的方法 apply 
   */
  var oldArrayMethods = Array.prototype; // 获取数组原型上的方法
  // 创建一个全新的对象, 根据原型链可以找到数组原型上的方法, 而且拓展方法时 不会影响原数组的原型方法

  var arrayMethods = Object.create(oldArrayMethods);
  var methods = ['push', 'pop', 'unshift', 'shift', 'splice', 'sort', 'reserve'];
  methods.forEach(function (method) {
    arrayMethods[method] = function () {
      var ob = this.__ob__;

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      var result = oldArrayMethods[method].apply(ob, args);
      var inserted;

      switch (method) {
        case 'push':
        case 'unshift':
          inserted = args;
          break;

        case 'splice':
          inserted = args.slice(2);
          break;
      }

      inserted && ob.observeArray(inserted);
      return result;
    };
  });
  /**
   * 为什么7个方法 只对三个做了处理呢?
   * 因为 push、unshift、splice  可以新增属性. 其他几个不能新增
   * 做响应式处理的目标是对所有数据观测, 所以不是新增的数据 不用处理.虽然其他的方法也能让数组改变
   * 注意: 这一步只做观测, 使页面更新的是  触发依赖 不要混淆.
   * 观测和页面更新没有直接关系,观测是为收集、触发依赖做铺垫
   */

  // 此处放所有的工具方法
  function isObject(obj) {
    return _typeof(obj) === 'object' && obj !== null;
  }

  /**
   * 为什么vue用function 这里用class? 
   * 因为 Function构造函数方便扩展原型上的属性和方法, 这里不需要
   */

  var Observe = /*#__PURE__*/function () {
    function Observe(data) {
      _classCallCheck(this, Observe);

      /**
       * 1、添加一个__ob__响应式标示,代表data已经被观测过, 对象数组都有
       * 2、data.__ob__  = this
       * 在数据上就可以获取到ob属性, 指代的是 observe实例
       */
      Object.defineProperty(data, '__ob__', {
        enumerable: false,
        configurable: false,
        value: this
      });
      /**
       * 因为实际开发中通过索引操作数组的情况并不多, 如果这里通过拦截数组的索引 做响应式太浪费性能
       * 所以 vue采用 函数劫持的方法 重写了 7个能改变数组本身的方法
       * 这里判断一下是 对象 or 数组
       * 利用原型链向上查找的特性,使得数组改变的方法从arrayMethods中取到
       */

      if (Array.isArray(data)) {
        data.__proto__ = arrayMethods;
        this.observeArray(data);
      } else {
        this.walk(data);
      }
    }
    /**
     * 无论数组还是对象, 都要遍历其中的每一项 做响应式处理
     */


    _createClass(Observe, [{
      key: "observeArray",
      value: function observeArray(data) {
        for (var i = 0; i < data.length; i++) {
          observe(data[i]);
        }
      }
    }, {
      key: "walk",
      value: function walk(data) {
        Object.keys(data).forEach(function (key) {
          defineReactive(data, key, data[key]);
        });
      }
    }]);

    return Observe;
  }();
  /**
   * vue2.0 有性能问题: 递归重写get set 数据嵌套很大的话 性能很差. vue3 使用proxy得到优化🐂
   * 
   */


  function defineReactive(data, key, value) {
    observe(value); // value可能还是一个对象 递归循环检测一下

    Object.defineProperty(data, key, {
      get: function get() {
        console.log('get----');
        return value;
      },
      set: function set(newVal) {
        if (newVal === value) return;
        observe(newVal);
        value = newVal;
      }
    });
  }

  function observe(data) {
    // 如果不是对象 就不用做响应式处理
    if (isObject(data)) {
      return;
    } // 如果有__ob__属性    表示观测过 也直接跳出


    if (data.__ob__ instanceof Observe) {
      return;
    } // 返回一个observe实例, 观测的核心代码在这里, 一个对象 对应一个ob实例 


    return new Observe(data);
  }

  function initState(vm) {
    var opts = vm.$options;

    if (opts.props) ;

    if (opts.methods) ;

    if (opts.data) {
      initData(vm);
    }

    function initData(vm) {
      // 这里就是如何做数据响应式的源码,首先拿到用户传入的数据
      var data = vm.$options.data;

      if (typeof data === 'function') {
        data = vm._data = data.call(vm);
      } else {
        data = vm._data = data;
      } // 把数据代理到vm实例上, 方便取的时候直接可以 vm.msg


      for (var key in data) {
        if (data.hasOwnProperty(key)) {
          proxy(vm, '_data', key);
        }
      } // 观测数据


      observe(data);
    }

    function proxy(target, property, key) {
      Object.defineProperty(target, key, {
        get: function get() {
          return target[property][key];
        },
        set: function set(newVal) {
          target[property][key] = newVal;
        }
      });
    }
  }

  function initMixin(Vue) {
    Vue.prototype._init = function (options) {
      var vm = this; // Vue 内的$options 就是用户传入的所有参数

      vm.$options = options; // 初始化状态

      initState(vm);
    };
  }

  /**
   * vue使用的是rollup打包 它的特点是把多个小模块 组合成复杂的逻辑
   * rollup更专注于打包javascript类库
   * 开发应用的时候更推荐用webpack, 开发库时用rollup
   * @param {*} options 
   */

  function Vue(options) {
    // 内部要进行初始化操作
    this._init(options);
  } // 由于组件初始化 会有很多方法 在这里写一堆 Vue.prototype.methods 不优雅 
  // 所以使用混入 更好 通过mixin引入
  // 在原型上添加属性或方法 


  initMixin(Vue);

  return Vue;

})));
//# sourceMappingURL=vue.js.map

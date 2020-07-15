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

  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
  }

  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }

  function _iterableToArrayLimit(arr, i) {
    if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return;
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"] != null) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }

  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;

    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

    return arr2;
  }

  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
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

      var result = oldArrayMethods[method].apply(this, args);
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
      console.log('数组被观测了', inserted);
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
        console.log('对象的get方法');
        return value;
      },
      set: function set(newVal) {
        if (newVal === value) return;
        observe(newVal);
        value = newVal;
        console.log('对象的set方法');
      }
    });
  }

  function observe(data) {
    // 如果不是对象 就不用做响应式处理
    if (!isObject(data)) {
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

  //              字母a-zA-Z_ - . 数组小写字母 大写字母  
  var ncname = "[a-zA-Z_][\\-\\.0-9_a-zA-Z]*"; // 标签名
  // ?:匹配不捕获   <aaa:aaa>

  var qnameCapture = "((?:".concat(ncname, "\\:)?").concat(ncname, ")"); // startTagOpen 可以匹配到开始标签 正则捕获到的内容是 (标签名)

  var startTagOpen = new RegExp("^<".concat(qnameCapture)); // 标签开头的正则 捕获的内容是标签名
  // 闭合标签 </xxxxxxx>  

  var endTag = new RegExp("^<\\/".concat(qnameCapture, "[^>]*>")); // 匹配标签结尾的 </div>
  // <div aa   =   "123"  bb=123  cc='123'
  // 捕获到的是 属性名 和 属性值 arguments[1] || arguments[2] || arguments[2]

  var attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; // 匹配属性的
  // <div >   <br/>

  var startTagClose = /^\s*(\/?)>/; // 匹配标签结束的 >
  function parseHTML(html) {
    // ast 树 表示html的语法
    var root; // 树根 

    var currentParent;
    var stack = []; // 用来判断标签是否正常闭合  [div]  解析器可以借助栈型结构
    // <div id="app" style="color:red"><span>    helloworld {{msg}}   </span></div>
    // vue2.0 只能有一个根节点 必须是html 元素
    // 常见数据结构 栈 队列 数组 链表 集合 hash表 树

    function createASTElement(tagName, attrs) {
      return {
        tag: tagName,
        attrs: attrs,
        children: [],
        parent: null,
        type: 1 // 1 普通元素  3 文本

      };
    } // console.log(html)


    function start(tagName, attrs) {
      // 开始标签 每次解析开始标签 都会执行此方法
      var element = createASTElement(tagName, attrs);

      if (!root) {
        root = element; // 只有第一次是根
      }

      currentParent = element;
      stack.push(element);
    } // <div> <span></span> hello world</div>   [div,span]


    function end(tagName) {
      // 结束标签  确立父子关系
      var element = stack.pop();
      currentParent = stack[stack.length - 1];

      if (currentParent) {
        element.parent = currentParent;
        currentParent.children.push(element);
      }
    }

    function chars(text) {
      // 文本
      text = text.replace(/\s/g, '');

      if (text) {
        currentParent.children.push({
          type: 3,
          text: text
        });
      }
    } // 根据 html 解析成树结构  </span></div>


    while (html) {
      var textEnd = html.indexOf('<');

      if (textEnd == 0) {
        var startTageMatch = parseStartTag();

        if (startTageMatch) {
          // 开始标签
          start(startTageMatch.tagName, startTageMatch.attrs);
        }

        var endTagMatch = html.match(endTag);

        if (endTagMatch) {
          advance(endTagMatch[0].length);
          end(endTagMatch[1]);
        } // 结束标签 

      } // 如果不是0 说明是文本


      var text = void 0;

      if (textEnd > 0) {
        text = html.substring(0, textEnd); // 是文本就把文本内容进行截取

        chars(text);
      }

      if (text) {
        advance(text.length); // 删除文本内容
      }
    }

    function advance(n) {
      html = html.substring(n);
    }

    function parseStartTag() {
      var start = html.match(startTagOpen); // 匹配开始标签

      if (start) {
        var match = {
          tagName: start[1],
          // 匹配到的标签名
          attrs: []
        };
        advance(start[0].length);

        var _end, attr;

        while (!(_end = html.match(startTagClose)) && (attr = html.match(attribute))) {
          advance(attr[0].length);
          match.attrs.push({
            name: attr[1],
            value: attr[3] || attr[4] || attr[5]
          });
        }

        if (_end) {
          advance(_end[0].length);
          return match;
        }
      }
    }

    return root;
  }

  var defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g;

  function genProps(attrs) {
    // {id:'app',style:{color:red}}
    var str = '';

    for (var i = 0; i < attrs.length; i++) {
      var attr = attrs[i]; // 取到每一个属性

      if (attr.name === 'style') {
        (function () {
          var obj = {}; //  color:red;background:green

          attr.value.split(';').forEach(function (item) {
            var _item$split = item.split(':'),
                _item$split2 = _slicedToArray(_item$split, 2),
                key = _item$split2[0],
                value = _item$split2[1];

            obj[key] = value;
          });
          attr.value = obj; // 将原来的字符串换成了 刚才格式化后的对象
        })();
      }

      str += "".concat(attr.name, ":").concat(JSON.stringify(attr.value), ",");
    }

    return "{".concat(str.slice(0, -1), "}");
  }

  function gen(node) {
    if (node.type === 1) {
      return generate(node);
    } else {
      // 文本的处理
      var text = node.text;

      if (!defaultTagRE.test(text)) {
        // 有变量 {{}}
        return "_v(".concat(JSON.stringify(text), ")"); // _v('helloworld')
      } else {
        var tokens = []; // 每次正则使用过后 都需要重新指定 lastIndex  aaaab

        var lastIndex = defaultTagRE.lastIndex = 0;
        var match, index;

        while (match = defaultTagRE.exec(text)) {
          index = match.index; // 通过 lastIndex,ndex

          tokens.push(JSON.stringify(text.slice(lastIndex, index)));
          tokens.push("_s(".concat(match[1].trim(), ")"));
          lastIndex = index + match[0].length;
        }

        if (lastIndex < text.length) {
          tokens.push(JSON.stringify(text.slice(lastIndex)));
        }

        return "_v(".concat(tokens.join('+'), ")");
      } // helloworld {{  msg  }}  aa {{bb}}  aaa   => _v('helloworld'+_s(msg)+"aa" + _s(bb))

    }
  }

  function genChildren(el) {
    // <div><span></span> hello</div>
    var children = el.children;

    if (children) {
      return children.map(function (c) {
        return gen(c);
      }).join(',');
    } else {
      return false;
    }
  }

  function generate(el) {
    var children = genChildren(el); // 生成孩子字符串

    var code = "_c(\"".concat(el.tag, "\",").concat(el.attrs.length ? "".concat(genProps(el.attrs)) : undefined).concat(children ? ",".concat(children) : '', ")");
    return code;
  } // 语法级的编译

  function compileToFunctions(template) {
    // 根据模版 通过正则匹配  解析字符串 生成ast抽象语法树  是个object  不同于vnode 表面和vnode很像
    var ast = parseHTML(template); // 核心是字符串拼接 解析ast

    var code = generate(ast);
    code = "with(this) { \r\nreturn ".concat(code, " \r\n}");
    /**
     * render(){ 
        * with(this){
        *  return _c('div',{id:app,style:{color:red}},_c('span',undefined,_v("helloworld"+_s(msg)) ))
        * }
     * }
     * 把字符串转换成函数
     */

    var render = new Function(code);
    return render; // 模板编译原理 
    // 1.先把我们的代码转化成ast语法树 （1）  parser 解析  (正则)
    // 2.标记静态树  （2） 树得遍历标记 markup  只是优化
    // 3.通过ast产生的语法树 生成 代码 =》 render函数  codegen
  }

  var has = {}; // vue源码里有的时候去重用的是set 有的时候用的是对象来实现的去重

  var queue = []; // 这个队列是否正在等待更新

  function flushSchedulerQueue() {
    for (var i = 0; i < queue.length; i++) {
      queue[i].run();
    }

    queue = [];
    has = {};
  }

  function queueWatcher(watcher) {
    var id = watcher.id;

    if (has[id] == null) {
      has[id] = true; // 如果没有注册过这个watcher，就注册这个watcher到队列中，并且标记为已经注册

      queue.push(watcher);
      nextTick(flushSchedulerQueue); // flushSchedulerQueue 调用渲染watcher
    }
  }
  var callbacks = []; // [flushSchedulerQueue,fn]

  var pending = false;

  function flushCallbacksQueue() {
    callbacks.forEach(function (fn) {
      return fn();
    });
    pending = false;
  }

  function nextTick(fn) {
    callbacks.push(fn); // 防抖

    if (!pending) {
      // true  事件环的概念 promise mutationObserver setTimeout setImmediate
      setTimeout(function () {
        flushCallbacksQueue();
      }, 0);
      pending = true;
    }
  }

  var id = 0; // 做一个watcher 的id 每次创建watcher时 都有一个序号 
  // 目前写到这里 只有一个watcher 渲染watchrer，只要视图中使用到了这个属性，而且属性变化了就要更新视图

  var Watcher = /*#__PURE__*/function () {
    function Watcher(vm, exprOrFn, cb, options) {
      _classCallCheck(this, Watcher);

      this.vm = vm;
      this.exprOrFn = exprOrFn;
      this.cb = cb;
      this.options = options;
      this.deps = []; // 这个watcher会存放所有的dep

      this.depsId = new Set();

      if (typeof exprOrFn == 'function') {
        this.getter = exprOrFn;
      }

      this.id = id++;
      this.get();
    }

    _createClass(Watcher, [{
      key: "run",
      value: function run() {
        this.get(); // 重新渲染
      }
    }, {
      key: "get",
      value: function get() {

        this.getter(); // 这句话就实现了视图的渲染  -》 操作是取值 
        // Vue是组件级别更新的
      }
    }, {
      key: "addDep",
      value: function addDep(dep) {
        var id = dep.id;

        if (!this.depsId.has(id)) {
          this.depsId.add(id);
          this.deps.push(dep);
          dep.addSub(this); // 让当前dep 订阅这个watcher
        }
      }
    }, {
      key: "update",
      value: function update() {
        // 更新原理
        queueWatcher(this); // 将watcher存储起来
        // this.get();  // 以前调用get方法是直接更新视图
      }
    }]);

    return Watcher;
  }();

  function patch(oldVnode, newVnode) {
    var isRealElement = oldVnode.nodeType;

    if (isRealElement) {
      // 真实元素
      var oldElm = oldVnode;
      var parentElm = oldElm.parentNode;
      var el = createElm(newVnode);
      parentElm.insertBefore(el, oldElm.nextSibling);
      parentElm.removeChild(oldElm);
      return el; // 渲染的真实dom
    } else {
      // dom diff 算法  同层比较 （默认想完整比对一棵树 O(n^3)）  O(n)
      // 不需要跨级比较
      // 两棵树 要先比较树根一不一样，再去比儿子长的是否一样
      if (oldVnode.tag !== newVnode.tag) {
        // 标签名不一致 说明是两个不一样的节点
        oldVnode.el.parentNode.replaceChild(createElm(newVnode), oldVnode.el);
      } // 标签一致 div  都是文本 tag = undefined


      if (!oldVnode.tag) {
        // 如果是文本 文本变化了 直接用新的文本替换掉老的文本
        if (oldVnode.text !== newVnode.text) {
          oldVnode.el.textContent = newVnode.text;
        }
      } // 一定是标签了 而且标签一致
      // 需要复用老的节点 替换掉老的属性


      var _el = newVnode.el = oldVnode.el; // 更新属性  diff 属性


      updateProperties(newVnode, oldVnode.data); // 此时属性就更新完毕了 当前的树根已经完成了
      // 比对孩子节点

      var oldChildren = oldVnode.children || []; // 老的孩子

      var newChildren = newVnode.children || []; // 新的孩子
      // 新老都有孩子 那就比较 diff核心
      // 老的有孩子 新的没孩子 直接删除
      // 新的有孩子  老的没孩子 直接插入

      if (oldChildren.length > 0 && newChildren.length > 0) {
        // diff  两个人都有儿子 ** 这里要不停的去比较孩子节点
        updateChildren(_el, oldChildren, newChildren); // 通过比较老孩子和新孩子 操作el中的儿子
      } else if (oldChildren.length > 0) {
        _el.innerHTML = '';
      } else if (newChildren.length > 0) {
        for (var i = 0; i < newChildren.length; i++) {
          var child = newChildren[i]; // 拿到一个个的孩子

          _el.appendChild(createElm(child)); // 浏览器会自动优化

        }
      }

      return _el;
    }
  }

  function isSameVnode(oldVnode, newVnode) {
    return oldVnode.key == newVnode.key && oldVnode.tag === newVnode.tag;
  }

  function updateChildren(parent, oldChildren, newChildren) {
    // Vue2.0 使用双指针的方式 来进行比对
    // v-for 要有key  key可以标识元素 是否发生变化 前后的key相同则可以复用这个元素
    var oldStartIndex = 0; // 老的开始的索引

    var oldStartVnode = oldChildren[0]; // 老的开始

    var oldEndIndex = oldChildren.length - 1; // 老的尾部索引

    var oldEndVnode = oldChildren[oldEndIndex]; // 获取老的孩子的最后一个

    var newStartIndex = 0; // 老的开始的索引

    var newStartVnode = newChildren[0]; // 老的开始

    var newEndIndex = newChildren.length - 1; // 老的尾部索引

    var newEndVnode = newChildren[newEndIndex]; // 获取老的孩子的最后一个

    function makeIndexByKey(children) {
      // 只需要创建一次 映射表
      var map = {};
      children.forEach(function (item, index) {
        map[item.key] = index;
      });
      return map;
    }

    var map = makeIndexByKey(oldChildren); // 根据老的孩子的key 创建一个映射表 
    // 1方案1 先开始从头部进行比较  O(n)  优化向后插入的逻辑
    // 比较时 就是采用最短的进行比较，剩下的要不是删除要么是增加

    while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
      // 如何判断 两个虚拟节点是否一致 就是用key + type 进行判断
      if (!oldStartVnode) {
        oldStartVnode = oldChildren[++oldStartIndex];
      } else if (!oldEndVnode) {
        oldEndVnode = oldChildren[--oldEndIndex];
      } else if (isSameVnode(oldStartVnode, newStartVnode)) {
        //标签和key一致 但是 元素可能属性不一致
        patch(oldStartVnode, newStartVnode); //自身属性 +  递归比较

        oldStartVnode = oldChildren[++oldStartIndex];
        newStartVnode = newChildren[++newStartIndex]; //  指针不停的在动
      } else if (isSameVnode(oldEndVnode, newEndVnode)) {
        // 2 方案2  从尾部开始比较 如果头部不一致 开始尾部比较， 优化向前插入
        patch(oldEndVnode, newEndVnode);
        oldEndVnode = oldChildren[--oldEndIndex]; // 移动尾部指针

        newEndVnode = newChildren[--newEndIndex];
      } else if (isSameVnode(oldStartVnode, newEndVnode)) {
        // 正序  和 倒叙  reverst sort
        // 3方案3 头不一样 尾不一样  头移尾  倒序操作
        patch(oldStartVnode, newEndVnode);
        parent.insertBefore(oldStartVnode.el, oldEndVnode.el.nextSibling); // 具备移动性

        oldStartVnode = oldChildren[++oldStartIndex];
        newEndVnode = newChildren[--newEndIndex];
      } else if (isSameVnode(oldEndVnode, newStartVnode)) {
        // 老的尾 和新的头比对
        patch(oldEndVnode, newStartVnode);
        parent.insertBefore(oldEndVnode.el, oldStartVnode.el);
        oldEndVnode = oldChildren[--oldEndIndex];
        newStartVnode = newChildren[++newStartIndex];
      } else {
        // 乱序比对  最终处理
        var moveIndex = map[newStartVnode.key];

        if (moveIndex == undefined) {
          // 是一个新元素 ，应该添加进去
          parent.insertBefore(createElm(newStartVnode), oldStartVnode.el);
        } else {
          var moveVnode = oldChildren[moveIndex];
          oldChildren[moveIndex] = null; // 占位 如果直接删除 可能会导致数组塌陷  [a,b,null,d]
          // 比对当前这两个元素属性和儿子

          patch(moveVnode, newStartVnode);
          parent.insertBefore(moveVnode.el, oldStartVnode.el);
        }

        newStartVnode = newChildren[++newStartIndex]; // 移动新的指针
      }
    }

    if (newStartIndex <= newEndIndex) {
      for (var i = newStartIndex; i <= newEndIndex; i++) {
        // appendChild   =  insertBefore null  js原生操作
        var ele = newChildren[newEndIndex + 1] == null ? null : newChildren[newEndIndex + 1].el;
        parent.insertBefore(createElm(newChildren[i]), ele); // parent.appendChild(createElm(newChildren[i]))
      }
    }

    if (oldStartIndex <= oldEndIndex) {
      // 说明新的已经循环完毕了 老的有剩余 剩余就是不要的
      for (var _i = oldStartIndex; _i <= oldEndIndex; _i++) {
        var child = oldChildren[_i];

        if (child != null) {
          parent.removeChild(child.el);
        }
      }
    } // 没有key 就直接比较类型，如果类型一样就复用 （隐藏的问题是儿子可能都需要重新创建）
    // 循环时尽量采用唯一的标识 作为key 如果用索引（例如倒叙 会采用索引来复用，不够准确） 如果是静态数据 （你爱用啥用啥）
    // 下周六 开班第一天 

  }

  function createElm(vnode) {
    // 需要递归创建
    var tag = vnode.tag,
        children = vnode.children,
        data = vnode.data,
        key = vnode.key,
        text = vnode.text;

    if (typeof tag == 'string') {
      // 元素 // 将虚拟节点和真实节点做一个映射关系 （后面diff时如果元素相同直接复用老元素 ）
      vnode.el = document.createElement(tag);
      updateProperties(vnode); // 跟新元素属性

      children.forEach(function (child) {
        // 递归渲染子节点 将子节点 渲染到父节点中
        vnode.el.appendChild(createElm(child));
      });
    } else {
      // 普通的文本
      vnode.el = document.createTextNode(text);
    }

    return vnode.el;
  }

  function updateProperties(vnode) {
    var oldProps = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    // 需要比较 vnode.data 和 oldProps的差异
    var el = vnode.el;
    var newProps = vnode.data || {}; // 获取老的样式和新的样式的差异 如果新的上面丢失了属性 应该在老的元素上删除掉

    var newStyle = newProps.style || {};
    var oldStyle = oldProps.style || {};

    for (var key in oldStyle) {
      if (!newStyle[key]) {
        el.style[key] = ''; // 删除之前的样式
      }
    }

    for (var _key in oldProps) {
      if (!newProps[_key]) {
        // 此时的元素一是以前
        el.removeAttribute(_key);
      }
    } // 其他情况直接用新的值覆盖掉老的值即可


    for (var _key2 in newProps) {
      if (_key2 == 'style') {
        for (var styleName in newProps.style) {
          // {color:red,background:green}
          el.style[styleName] = newProps.style[styleName];
        } // 浏览器重新渲染也会看值是否变化

      } // event 
      else {
          el.setAttribute(_key2, newProps[_key2]);
        }
    }
  }

  function lifeCycleMixin(Vue) {
    Vue.prototype._update = function (vnode) {
      var vm = this; // 将虚拟节点 变成 真实节点 替换掉$el
      // 后续 dom diff 也会执行此方法

      vm.$el = patch(vm.$el, vnode);
    };
  }
  function mountComponent(vm, el) {
    // Vue在渲染的过程中 会创建一个 所谓的“渲染watcher ” 只用来渲染的
    // watcher就是一个回调 每次数据变化 就会重新执行watcher
    // Vue是不是MVVM框架
    callHook(vm, 'beforeMount');

    var updateComponent = function updateComponent() {
      // 内部会调用刚才我们解析后的render方法 =》 vnode
      // _render => options.render 方法
      // _update => 将虚拟dom 变成真实dom 来执行
      console.log('update');

      vm._update(vm._render());
    }; // 每次数据变化 就执行 updateComponent 方法 进行更新操作


    new Watcher(vm, updateComponent, function () {}, true);
    callHook(vm, 'mounted'); // vue 响应式数据的规则 数据变了 视图会刷新
  }
  function callHook(vm, hook) {
    // vm.$options
    var handlers = vm.$options[hook]; // 典型的发布订阅模式

    if (handlers) {
      for (var i = 0; i < handlers.length; i++) {
        // [fn,fn,fn]
        handlers[i].call(vm); // 所有的生命周期的this 指向的都是当前的实例
      }
    }
  }

  function initMixin(Vue) {
    Vue.prototype._init = function (options) {
      var vm = this; // Vue 内的$options 就是用户传入的所有参数

      vm.$options = options; // 初始化状态

      initState(vm); // 根据模版进行渲染, 用户传入了el属性才执行挂载 $mount  否则要手动 

      if (vm.$options.el) {
        vm.$mount(vm.$options.el);
      }
    };
    /**
     * 传入的el可以是字符串 也可以是dom对象. 这里默认是string 源码中有判断 typeof el === 'string'
     * 详见 171页
     * 三者的优先级:  render > template > el
     */


    Vue.prototype.$mount = function (el) {
      var vm = this;
      el = vm.$el = document.querySelector(el); // 如果render不存在 将模版编译成render函数 赋值给$options.render

      var opts = vm.$options;

      if (!opts.render) {
        var template = opts.template;

        if (!template && el) {
          template = el.outerHTML;
        }

        var render = compileToFunctions(template);
        opts.render = render;
      } // render存在 就不需要编译了 用户传入了一个render
      // 挂载即可


      mountComponent(vm);
    };
  }

  function createTextVNode(text) {
    return vnode(undefined, undefined, undefined, undefined, text);
  }
  function createElement(tag) {
    var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    for (var _len = arguments.length, children = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
      children[_key - 2] = arguments[_key];
    }

    // vue中的key 不会作为属性传递给组件
    return vnode(tag, data, data.key, children);
  } // 虚拟节点是 产生一个对象 用来描述dom结构 增加自定义属性
  // ast 他是描述 dom语法的 

  function vnode(tag, data, key, children, text) {
    return {
      tag: tag,
      data: data,
      key: key,
      children: children,
      text: text
    };
  }

  function renderMixin(Vue) {
    Vue.prototype._v = function (text) {
      // 创建文本的虚拟及诶点
      return createTextVNode(text);
    };

    Vue.prototype._c = function () {
      return createElement.apply(void 0, arguments);
    };

    Vue.prototype._s = function (val) {
      // 判断当前这个值是不是对象 ，如果是对象 直接转换成字符串 ，防止页面出现[object Object]
      return val == null ? '' : _typeof(val) === 'object' ? JSON.stringify(val) : val;
    };

    Vue.prototype._render = function () {
      // 调用我们自己实现的render方法
      var vm = this;
      var render = vm.$options.render;
      var vnode = render.call(vm); // _c _c  _s

      return vnode;
    };
  }

  /**
   * vue使用的是rollup打包 它的特点是把多个小模块 组合成复杂的逻辑
   * rollup更专注于打包javascript类库
   * 开发应用的时候更推荐用webpack, 开发库时用rollup
   */

  function Vue(options) {
    // 内部要进行初始化操作
    this._init(options);
  } // 由于组件初始化 会有很多方法 在这里写一堆 Vue.prototype.methods 不优雅
  // 所以使用混入 更好 通过mixin引入
  // 在原型上添加属性或方法


  initMixin(Vue);
  renderMixin(Vue);
  lifeCycleMixin(Vue);

  return Vue;

})));
//# sourceMappingURL=vue.js.map

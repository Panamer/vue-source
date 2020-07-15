import {parseHTML} from './parser.js'
import {generate} from './generator.js';

// template => render函数  实现模版的编译
export function compileToFunctions(template) {
    // 根据模版 通过正则匹配  解析字符串 生成ast抽象语法树  是个object  不同于vnode 表面和vnode很像
    let ast = parseHTML(template)

    // 核心是字符串拼接 解析ast
    let code = generate(ast)
    code = `with(this) { \r\nreturn ${code} \r\n}`
    /**
     * render(){ 
        * with(this){
        *  return _c('div',{id:app,style:{color:red}},_c('span',undefined,_v("helloworld"+_s(msg)) ))
        * }
     * }
     * 把字符串转换成函数
     */
    const render = new Function(code)
    return render;
    // 模板编译原理 
    // 1.先把我们的代码转化成ast语法树 （1）  parser 解析  (正则)
    // 2.标记静态树  （2） 树得遍历标记 markup  只是优化
    // 3.通过ast产生的语法树 生成 代码 =》 render函数  codegen
}
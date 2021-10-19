/* 数据初始化 */

import {
  initState
} from "./state"

import { compileToFunctions } from "./compiler/index";
import { mergeOptions } from "./util";
import { callHook } from "./lifecycle";

// initMixin 把_init 方法挂载在 Vue 原型 供 Vue 实例调用  
export function initMixin(Vue) {
  Vue.prototype._init = function (options) {
    const vm = this; //  可以直接写成this   只是因为Vue是遵从mvvm思想  所以一般用vm指代this
    //  这里的this代表调用_init方法的对象(实例对象)
    //  this.$options就是用户new Vue的时候传入的属性

    // 在 init 初始化的时候调用 mergeOptions 来进行选项合并 之后在需要调用生命周期的地方运用 callHook 来执行用户传入的相关方法
    vm.$options = mergeOptions(vm.constructor.options, options);
    callHook(vm, "beforeCreate");   // 初始化数据之前
    // 初始化状态
    initState(vm);
    callHook(vm, "created") // 初始化数据之后

    // 如果有el属性  进行模板渲染
    if (vm.$options.el) {
      vm.$mount(vm.$options.el);
    }
  }

  // 这块代码在源码里面的位置其实是放在entry-runtime-with-compiler.js里面  
  // 代表的是Vue源码里面包含了compile编译功能  这个和runtime-only版本需要区分开
  Vue.prototype.$mount = function (el) {
    const vm = this;
    const options = vm.$options;
    el = document.querySelector(el);

    // 如果不存在render属性
    if (!options.render) {
      // 如果存在templete属性
      let templete = options.templete;

      if (!templete && el) {
          // 如果不存在render和template 但是存在el属性 直接将模板赋值到el所在的外层html结构（就是el本身 并不是父元素）
          templete = el.outerHTML;
      }

      // 最终需要把templete模板转化成render函数
      if (templete) {
        const render = compileToFunctions(templete);
        options.render = render;
      }
    }

    // 将当前组件实例挂载到真实的el 节点上面
    return mountComponent(vm, el);
    /* 
      接着看$mount 方法 我们主要关注最后一句话 mountComponent 就是组件实例挂载的入口函数
      这个方法放在源码的 lifecycle 文件里面 代表了与生命周期相关 因为我们组件初始渲染前后对应有 beforeMount 和 mounted 生命周期钩子
    */
  }

}

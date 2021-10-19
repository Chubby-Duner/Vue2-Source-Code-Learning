import initExtend from "./initExtend";
import initAssetRegisters from "./assets"
const ASSETS_TYPE = ["component", "directive", "filter"];

// initGlobalApi方法主要用来注册Vue的全局方法 比如之前写的Vue.Mixin 和今天的Vue.extend Vue.component等  
export  function initGlobalApi(Vue) {
  Vue.options = {}; // 全局的组件 指令 过滤器
  ASSETS_TYPE.forEach(type => {
    Vue.options[type + "s"] = {};
  })
  Vue.options._base = Vue; // _base指向Vue

  initExtend(Vue);   // extend方法定义
  initAssetRegisters(Vue); // assets注册方法 包含组件 指令和过滤器
}

// exposed util methods.
// NOTE: these are not considered part of the public API - avoid relying on
// them unless you are aware of the risk.  

Vue.util = {
  warn,
  extend,
  mergeOptions,
  defineReactive,
};
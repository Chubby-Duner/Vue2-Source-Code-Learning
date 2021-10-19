//  Vue入口文件

import {
  initMixin
} from "./init.js"

import { lifecycleMixin } from "./lifecycle.js";
import { renderMixin } from "./render.js";

// Vue就是一个构造函数  通过new 关键字进行实例化
function Vue(options) {
  // 从这里开始进行Vue初始化工作
  this._init(options);
}

// init方法是挂载在Vue原型的方法  通过引入文件的方式进行原型挂载需要传入Vue
// 此做法有利于代码分割
initMixin(Vue);

// 混入_render
renderMixin(Vue);
// 混入_update
lifecycleMixin(Vue);
export default Vue;

// 因为在 Vue 初始化可能会处理很多事情 比如数据处理 事件处理 生命周期处理等等 所以划分不同文件引入利于代码分割，
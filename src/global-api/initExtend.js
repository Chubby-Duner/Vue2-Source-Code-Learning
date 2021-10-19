// Vue.extend 核心思路就是使用原型继承的方法返回了 Vue 的子类 并且利用 mergeOptions 把传入组件的 options 和父类的 options 进行了合并
import { mergeOptions } from "../util/index";
export default function initExtend(Vue) {
  let cid = 0;  // 组件的唯一标识
  // 创建子类集成vue父类 便于属性扩展
  Vue.extend = function VueComponent(options) {
    this._init(options); // 调用Vue初始化方法
  }
  Sub.cid = cid ++;
  Sub.prototype = Object.create.create(this.options);  // 子类原型指向父类
  Sub.prototype.constructor = Sub;  // constructor指向自己
  Sub.options = mergeOptions(this.options, extendOptions); // 合并自己的options和父类的options
  return Sub;
}

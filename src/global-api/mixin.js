// 新建 global-api 文件夹 把 mixin 定义为 Vue 的全局方法 核心方法就是利用 mergeOptions 把传入的选项混入到自己的 options 上面

import { mergeOptions } from '../util/index'
export default function initMixin(Vue) {
  Vue.mixin = function (mixin) {
    // 合并对象
    this.options = mergeOptions(this.options, mixin)
  }
}
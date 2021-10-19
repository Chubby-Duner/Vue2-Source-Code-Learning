/* 数据初始化 */

import { watch } from "chokidar";
import Vue from "./index.js";
import Dep from "./observer/dep.js";
import {
  observe
} from "./observer/index.js"

import Watcher from "./observer/watcher"

// 初始化状态 注意这里的顺序 比如我经常面试会问到 是否能在data里面直接使用prop的值 为什么？
// 这里初始化的顺序依次是 prop>methods>data>computed>watch

// initState 咱们主要关注 initData 里面的 observe 是响应式数据核心 所以另建 observer 文件夹来专注响应式逻辑 其次我们还做了一层数据代理 把data代理到实例对象this上

export function initState(vm) {
  // 获取传入的数据对象
  const opts = vm.$options;
  if (opts.props) {
    initProps(vm);
  }
  if (opts.methods) {
    initMethod(vm);
  }
  if (opts.data) {
    initData(vm);
  }
  if (opts.computed) {
    initComputed(vm);
  }
  if (opts.watch) {
    initWatch(vm);
  }
}

// 初始化data
function initData(vm) {
  let data = vm.$options.data;
  //  实例的_data属性就是传入的data
  //  vue组件data推荐使用函数  防止数据在组件之间共享
  data = vm._data = typeof data === "function" ? data.call(vm) : data || {};

  //  把data数据代理到vm 也就是Vue实例上面  我们可以使用this.a来访问this._data.a
  for (let key in data) {
    proxy(vm, `_data`, key);   //  _data  ----   vm._data是私有属性  我们在上面创建的  其实就是指代data  方便之后再vm上使用
  }
  // 对数据进行观测 -- 响应式数据核心
  observe(data);
}

// 初始化watch
function initWatch(vm) {
  let watch = vm.$options.watch;
  for (let k in watch) {
    const handler = watch[k];  // 用户自定义watch的学法可能是数组 对象 函数 字符串
    if (Array.isArray(handler)) {
      // 如果是数组就遍历进行创建
      handler.forEach(handle => {
        createWatch(vm, k, handle);
      })
    } else {
      createWatch(vm, k, handler);
    }
  }
}

// 初始化computed
function initComputed(vm) {
  const computed = vm.$options.computed;

  const watchers = (vm._computedWatchers = {});  // 用来存放计算watcher

  for (let k in computed) {
    const userDef = computed[k];  // 获取用户定义的计算属性
    const getter = typeof userDef === "function" ? userDef : userDef.get; // 创建计算属性watcher使用
    // 创建计算watcher lazy设置为true
    watchers[k] = new Watcher(vm, getter, () => {}, { lazy: true });
    defineComputed(vm, k, userDef);
  }
}
// 创建watcher的核心
function createWatch(vm, exprOrFn, handler, options = {}) {
  if (typeof handler === "object") {
    options = handler; // 保存用户传入的对象
    handler = handler.handler; // 这个代表真正用户传入的函数
  }
  if (typeof handler === "string") {
    // 代表传入的是定义好的methods方法
    handler = vm[handler]
  }
  // 调用vm.$watch创建用户watcher
  return vm.$watch(exprOrFn, handler, options);
}

// 数据代理
function proxy(object, sourceKey, key) {
  Object.defineProperty(object, key, {
    get() {
      return object[object][key];
    },
    set(newValue) {
      object[sourceKey][key] = newValue;
    }
  })
}

Vue.prototype.$watch = function (exprOrFn, cb, options) {
  const vm = this;
  // user: true 这里表示是一个用户watcher
  let watcher = new Watcher(vm, exprOrFn, cb, { ...options, user: true });
  // 如果有immediate属性 代表需要立即执行回调
  if (options.immediate) {
    cb(); // 立刻执行
  }
}

const sharePropertyDefinition = {
  enumerable: true,
  configurable: true,
  get: () => {},
  set: () => {}
}

// 重新定义计算属性  对get和set劫持
function defineComputed(target, key, userDef) {
  if (typeof userDef === "function") {
    // 如果是一个函数  需要手动赋值到get上
    sharePropertyDefinition.get = createComputedGetter(key);
  } else {
    sharePropertyDefinition.get = createComputedGetter(key);
    sharePropertyDefinition.set = userDef.set;
  }
    //  利用Object.defineProperty来应对计算属性的get和set进行劫持
    Object.defineProperty(target, key, sharePropertyDefinition);
}

// 重写计算属性的get方法 来判断是否需要进行重新计算
function createComputedGetter(key) {
  return function () {
    const watcher = this._computedWatchers[key]; // 获取对应的计算属性watcher
    if (watch) {
       if (watch.dirty) {
          watcher.evaluate();  // 计算属性取值的时候  如果是脏的  需要重新求值

          if (Dep.target) {
            // 如果Dep还存在target 这个时候一般为渲染watcher 计算属性依赖的数据也需要收集
            watcher.depend();
          }
       }
       return watcher.value;
    }
  }
}

/* 
defineComputed 方法主要是重新定义计算属性 其实最主要的是劫持 get 方法 也就是计算属性依赖的值 为啥要劫持呢 因为我们需要根据依赖值是否发生变化来判断计算属性是否需要重新计算

createComputedGetter 方法就是判断计算属性依赖的值是否变化的核心了 我们在计算属性创建的 Watcher 增加 dirty 标志位 如果标志变为 true 代表需要调用 watcher.evaluate 来进行重新计算了

*/
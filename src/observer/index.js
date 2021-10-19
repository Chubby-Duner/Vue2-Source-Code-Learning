/* 对象的数据劫持 */

import { arrayMethods } from "./array"   //  数组的观测

class Observer {
  // 观测值
  constructor(value) {
    if (Array.isArray(value)) {
        //  这里对数组做了额外的判断
        //  通过重写数组原型方法来对数组的七种方法进行拦截
        value.__proto__ = arrayMethods;
        // 如果数组里面还包含数组  需要递归判断
        this.observeArray(value);
    } else {
      this.walk(value);
    }

    Object.defineProperty(value, "__ob__", {
      //  值指代的就是Observer的实例
      value: this,
      // 不可枚举
      enumerable: false,
      writable: true,
      configurable: true,
    })
  }
  
  walk(data) { 
    // 对象上的所有属性依次进行观测
    let keys = Object.keys(data);
    for (let i = 0; i < keys.length; i++) {
      let key = keys[i];
      let value = data[key];
      defineReactive(data, key, value);
    }
  }

  oberseveArray(data) {
    for (let i = 0; i < items.length; i++) {
      observe(item[i]);
    }
  }
}

// Object.defineProperty数据劫持核心  兼容性在ie9以及以上
function defineReactive(data, key, value) {
  let childOb = observe(value); // 递归关键   childOb就是Observe实例
  // --如果value还是一个对象会继续走一遍odefineReactive 层层遍历一直到value不是对象才停止
  //   思考？如果Vue数据嵌套层级过深 >>性能会受影响

  let dep = new Dep();

  Object.defineProperty(data, key, {
    get() {
      console.log("获取值");
      //  页面取值的时候 可以把watcher收集到dep里面 -- 依赖收集
      if (Dep.target) {
        // 如果有watch  dep就会保存watcher 同时watcher 也会保存dep
        dep.depend();
        if (childOb) {
          childOb.dep.depend();
          // 这里表示 属性的值依然是一个对象 包含数组和对象 childOb指代的就是Observer实例对象  里面的dep进行依赖收集
          // 比如{a:[1,2,3]} 属性a对应的值是一个数组 观测数组的返回值就是对应数组的Observer实例对象
          if (Array.isArray(value)) {
             // 如果数据结构类似 {a:[1,2,[3,4,[5,6]]]} 这种数组多层嵌套  数组包含数组的情况  那么我们访问a的时候 只是对第一层的数组进行了依赖收集 里面的数组因为没访问到  所以五大收集依赖  但是如果我们改变了a里面的第二层数组的值  是需要更新页面的  所以需要对数组递归进行依赖收集
            if (Array.isArray(value)) {
                // 如果内部还是数组
                dependArray(value);
            }
          }
        }
      }
      return value;
    },
    set(newValue) {
      if (newValue === value) return;
      console.log("设置值");
      // 如果赋值的新值也是一个对象  需要观测
      observe(newValue);
      value = newValue;
      dep.notify();   // 通知渲染watcher 去更新 -- 派发更新    
    }
  })
}

// 递归收集数组依赖
function dependArray(value) {
  for (let e, i = 0, l = value.length; i < l; i ++) {
      e = value[i];
      // e.__ob__代表e已经被响应式观测了 但是没有收集依赖 所以把他们收集到自己的Observer实例的dep里面
      e && e.__ob__ && e.__ob__.dep.depend();
      if (Array.isArray(e)) {
        // 如果数组里面还有数组  就递归去收集依赖 
        dependArray();
      }
  }
}

export function observe(value) {
  // 如果传过来的是对象或者数组  进行属性劫持  Taro（vue配置）
  if (Object.prototype.toString.call(value) === "[object object]" || Array.isArray(value)) {
    return new Observer(value);
  }
}

// 数据劫持核心是 defineReactive 函数 主要使用 Object.defineProperty 来对数据 get 和 set 进行劫持 这里就解决了之前的问题 为啥数据变动了会自动更新视图 我们可以在 set 里面去通知视图更新  

/* 

思考 1.这样的数据劫持方式对数组有什么影响？

这样递归的方式其实无论是对象还是数组都进行了观测 但是我们想一下此时如果 data 包含数组比如 a:[1,2,3,4,5] 那么我们根据下标可以直接修改数据也能触发 set 但是如果一个数组里面有上千上万个元素 每一个元素下标都添加 get 和 set 方法 这样对于性能来说是承担不起的 所以此方法只用来劫持对象

思考 2.Object.defineProperty 缺点？

对象新增或者删除的属性无法被 set 监听到 只有对象本身存在的属性修改才会被劫持

作者：Big shark@LX
链接：https://juejin.cn/post/6935344605424517128
来源：掘金

*/
//  组件挂载核心方法   mountComponent

// 表示生命周期相关功能 核心导出 mountComponent 函数 主要使用 vm._update(vm._render())方法进行实例挂载
import {
  patch
} from "./vdom/patch";

export function mountComponent(vm, el) {
  // 上一步模板编译解析生成了render函数
  // 下一步就是执行vm.render方法  调用生成的render函数  生成虚拟dom
  //  最后使用vm.update() 方法把虚拟dom渲染到页面上

  // 真实的el选项赋值给实例的$el属性  为之后虚拟dom产生的新的dom替换来的dom做铺垫

  // vm.$el = el;

  //   _update和._render方法都是挂载在Vue原型的方法  类似_init

  // vm._update(vm._render());

  let updateComponent = () => {
    console.log("刷新页面");
    vm._update(vm._render());
  }

  // 主要功能就是执行核心渲染页面的方法
  new Watcher(vm, updateComponent, null, true)
}


// 虚拟 dom 转化成真实 dom 核心方法 _update
export function lifecycleMixin(Vue) {
  // 把_update挂载在Vue的原型
  Vue.prototype._update = function (vnode) {
    const vm = this;
    const prevVnode = vm._vnode; // 保留上一次的vnode
    vm._vnode = vnode;
    if (!prevVnode) {
      // patch是渲染vnode为真实dom核心
      vm.$el = patch(vm.$el, vnode); // 初次渲染 vm._vnode肯定不存在 要通过虚拟节点 渲染出真实的dom 赋值给$el属性
    } else {
      vm.$el = patch(prevVnode, vnode); // 更新时把上次的vnode和这次更新的vnode穿进去 进行diff算法
    }
  };
}

// 把$options上面的生命周期依次遍历进行调用
export function callHook(vm, hook) {
  // 依次执行生命周期对应的方法
  const handles = vm.$options[hook];
  if (handles) {
    for (let i = 0; i < handles.length; i++) {
      // 生命周期里面的this指向当前实例
      handles[i].call(vm);
    }
  }
}

export function mountComponent(vm, el) {
  vm.$el = el;
  // 引入watcher的概念 这里注册一个渲染watcher 执行vm._update(vm._render())方法渲染视图  
  callHook(vm, "beforeMount"); // 初始渲染之前
  let updateComponent = () => {
    vm._update(vm._render());
  }
  new watcher(
    vm,
    updateComponent,
    () => {
      callHook(vm, "beforeUpdate"); // 更新之前 
    },
    true
  )
  callHook(vm, "mounted");  // 渲染完成之后
}
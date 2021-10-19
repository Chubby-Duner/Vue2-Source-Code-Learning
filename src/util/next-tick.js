// 新建 util/next-tick.js 代表工具类函数 因为 nextTick 用户也可以手动调用 主要思路就是采用微任务优先的方式调用异步方法去执行 nextTick 包装的方法

let callback = [];
let pending = false;
function flushCallbacks() {
  // 把标志还原为false
  pending = false;  
  // 依次执行回调
  for (let i = 0; i < callback.length; i++) {
    callback[i]();
  }
}

// 定义异步方法  采用优雅降级
let timerFunc;
if (typeof Promise !== "undefined") {
  // 如果支持promise
  const p = Promise.resolve();
  timerFunc = () => {
    p.then(flushCallbacks);
  }
} else if (typeof MutationObserver !== "undefined") {
  // MutationObserver  主要是监听dom变化  也是一个异步方法
  let counter = 1;
  const observe = new MutationObserver(flushCallbacks);
  const textNode = document.createTextNode(String(counter));;
  observe.observe(textNode, {
    characterData: true,
  })
  timerFunc = () => {
    counter = (counter + 1) % 2;
    textNode.data = String(counter);
  }
} else if (typeof setImmediate !== "undefined") {
  // 如果页面都不支持 判断setImmediate
  timerFunc = () => {
    setImmediate(flushCallbacks);
  }
} else {
  timerFunc = () => {
    setTimeout(flushCallbacks, 0);
  }
}

export function nextTick(cb) {
  // 除了渲染watcher  还有用户自己手动调用的nextTick 一起被手机到数组
  callbacks.push(cb);
  if(!pending) {
      // 如果多次调用nextTick 只会执行一次异步 等异步队列清空之后再把标志变为false
      pending = true;
      timerFunc();
  }
}
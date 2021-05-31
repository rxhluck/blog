# Vue实例挂载

## $mount函数
通过vue-cli创建项目时会选择多种构建模式，针对不同构建模式`$mount`有不同的实现，我们经常用的`compile`模式下，`$mount`是这么定义的
```js
const mount = Vue.prototype.$mount
Vue.prototype.$mount = function (
  el?: string | Element,
  hydrating?: boolean
): Component {
  .....省略代码
  return mount.call(this, el, hydrating)
}
```
在上面方法中，先将Vue原型上的`$mount`方法缓存下来放于`mount`变量，再重写了该方法，最终再执行`mount`方法。
省略的代码实际是判断是否有`render`函数，如果没有的话就生成`render`函数，具体生成的方法，在编译模块中介绍。

注意:在Vue2.0中，最终都是需要`render`函数，无论你是使用.vue文件，还是写了`template`，最终都会转换为`render`函数。

那么最终调用的`$mount`函数，定义于`src/platform/web/runtime/index.js`中，该函数是直接再`runtime-only`版本下直接调用，接收了两个参数`el`可以是字符串，也可以是真实的dom元素，最终都会生成真实的dom元素，最终执行了`mountComponent`函数。
```js
// public mount method
Vue.prototype.$mount = function (
  el?: string | Element,
  hydrating?: boolean
): Component {
  el = el && inBrowser ? query(el) : undefined
  return mountComponent(this, el, hydrating)
}
```

## mountComponent函数
mountComponent函数会完成渲染的全部工作，其中最为核心的两步是，定义了`updateComponent`函数和实例化渲染`Watcher`,
```js
export function mountComponent (
  vm: Component,
  el: ?Element,
  hydrating?: boolean
): Component {
  vm.$el = el
  // 省略代码
  callHook(vm, 'beforeMount')

  let updateComponent
  /* istanbul ignore if */
  if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
   // 省略代码
  } else {
    updateComponent = () => {
      vm._update(vm._render(), hydrating)
    }
  }

  // we set this to vm._watcher inside the watcher's constructor
  // since the watcher's initial patch may call $forceUpdate (e.g. inside child
  // component's mounted hook), which relies on vm._watcher being already defined
  new Watcher(vm, updateComponent, noop, {
    before () {
      if (vm._isMounted) {
        callHook(vm, 'beforeUpdate')
      }
    }
  }, true /* isRenderWatcher */)
  hydrating = false

  // manually mounted instance, call mounted on self
  // mounted is called for render-created child components in its inserted hook
  if (vm.$vnode == null) {
    vm._isMounted = true
    callHook(vm, 'mounted')
  }
  return vm
}
```
1.mountComponent首先执行的是实例化渲染`Watcher`，将`updateComponent`作为回调函数传入，并在实例化时，执行了回调函数，并且会监听`vm`上数据变化再次执行该函数进行渲染。

2.`updateComponent`函数执行也分为两步，第一步执行`vm`实例上的`_render`函数生成`vnode`，再执行`_update`函数渲染到页面上，完成渲染的全部流程。




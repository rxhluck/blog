# Vue实例挂载

## $mount方法究竟做了什么

在之前我们知道了`_init` 函数最后执行了`vm.$mount(vm.$options.el)`实现了vm挂载，挂载的目标就是把模板渲染成最终的 DOM。那么`$mount`方法定义在哪呢，$mount方法根据Vue编译模式和平台不同，在不同的编译入口文件有不同的实现。根据课程中主要分析的是`runtime-with-compiler`方式构建的Vue源码。

```js
const mount = Vue.prototype.$mount
Vue.prototype.$mount = function (
  el?: string | Element,
  hydrating?: boolean
): Component {
  el = el && query(el)

  /* istanbul ignore if */
  if (el === document.body || el === document.documentElement) {
    process.env.NODE_ENV !== 'production' && warn(
      `Do not mount Vue to <html> or <body> - mount to normal elements instead.`
    )
    return this
  }

  const options = this.$options
  // resolve template/el and convert to render function
  if (!options.render) {
    let template = options.template
    if (template) {
      if (typeof template === 'string') {
        if (template.charAt(0) === '#') {
          template = idToTemplate(template)
          /* istanbul ignore if */
          if (process.env.NODE_ENV !== 'production' && !template) {
            warn(
              `Template element not found or is empty: ${options.template}`,
              this
            )
          }
        }
      } else if (template.nodeType) {
        template = template.innerHTML
      } else {
        if (process.env.NODE_ENV !== 'production') {
          warn('invalid template option:' + template, this)
        }
        return this
      }
    } else if (el) {
      template = getOuterHTML(el)
    }
    if (template) {
      /* istanbul ignore if */
      if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
        mark('compile')
      }

      const { render, staticRenderFns } = compileToFunctions(template, {
        shouldDecodeNewlines,
        shouldDecodeNewlinesForHref,
        delimiters: options.delimiters,
        comments: options.comments
      }, this)
      options.render = render
      options.staticRenderFns = staticRenderFns

      /* istanbul ignore if */
      if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
        mark('compile end')
        measure(`vue ${this._name} compile`, 'compile', 'compile end')
      }
    }
  }
  return mount.call(this, el, hydrating)
}
```
在上面的代码中，先将Vue本身的`$mount`方法缓存起来，再重写了该方法，重写的方法中，首先定义了不能是`document.body`和`html`这一类的根节点，然后判断如果你没有定义`render`函数，则会将`el`、`template`转化为render函数，在vue2.x中，渲染最后都是需要`render`函数的。无论你是通过`.vue`文件，`template`或`el`属性最终都会通过`compileToFunctions`转换为render函数，最后再调用缓存的`$mount`函数执行渲染。


 被缓存的`$mount` 方法在 `src/platform/web/runtime/index.js` 中定义，el表示最后被挂载的元素，在浏览器环境中，如果`el`为字符串，那么他会通过`query`方法将其转换为DOM。
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

## mountComponent做了什么
`$mount` 方法实际上会去调用 `mountComponent` 方法，这个方法定义在 `src/core/instance/lifecycle.js` 文件中：

```js
export function mountComponent (
  vm: Component,
  el: ?Element,
  hydrating?: boolean
): Component {
  vm.$el = el
  if (!vm.$options.render) {
    vm.$options.render = createEmptyVNode
    if (process.env.NODE_ENV !== 'production') {
      /* istanbul ignore if */
      if ((vm.$options.template && vm.$options.template.charAt(0) !== '#') ||
        vm.$options.el || el) {
        warn(
          'You are using the runtime-only build of Vue where the template ' +
          'compiler is not available. Either pre-compile the templates into ' +
          'render functions, or use the compiler-included build.',
          vm
        )
      } else {
        warn(
          'Failed to mount component: template or render function not defined.',
          vm
        )
      }
    }
  }
  callHook(vm, 'beforeMount')

  let updateComponent
  /* istanbul ignore if */
  if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
    updateComponent = () => {
      const name = vm._name
      const id = vm._uid
      const startTag = `vue-perf-start:${id}`
      const endTag = `vue-perf-end:${id}`

      mark(startTag)
      const vnode = vm._render()
      mark(endTag)
      measure(`vue ${name} render`, startTag, endTag)

      mark(startTag)
      vm._update(vnode, hydrating)
      mark(endTag)
      measure(`vue ${name} patch`, startTag, endTag)
    }
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
在这段代码中核心在于

一、实例化了Watcher类，他在这的核心作用在于，第一次调用就执行回调函数执行了`updateComponent`函数，并且会去监听vm实例变化会再次去触发回调函数进行重渲染。

二、updateComponent函数，先通过之前定义好的`_render`函数生成vnode，再通过`_update`渲染到页面上。

## 总结
在不同的构建模式和平台下，`$mount`有不同的处理方式，但是最终都会需要`render`函数定义到`vm`实例上，然后通过执行`mountComponent`函数进行渲染，该函数有两个核心，一个是实例化了 `Watcher`类，一个是定义了`updateComponent`函数,其中`updateComponent`函数是先调用之前的`_render`函数生成vnode，然后渲染。`Watcher`类在实例化时，会执行回调函数也就是传入的`updateComponent`函数，并且在后续`vm`实例监听数值发生变化时执行`updateComponent`进行重新渲染。

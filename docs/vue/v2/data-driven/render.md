# render

在上一节，我们知道Vue在`mountComponent`方法中将`updateComponent`函数传入`Watcher`函数，在`Watcher`实例化的时候，通过回调执行了`vm.update(vm._render(), hydrating)`进行了第一次渲染，其中`vm._render()`返回的是一个`vnode`，接下来我们来分析`_render()`函数。

## _render()函数究竟做了什么？

`_render`函数是一个定义在Vue原型上的私有方法，最终返回的是一个vnode，它定义在 `src/core/instance/render.js` 文件中：
```js
Vue.prototype._render = function (): VNode {
  const vm: Component = this
  const { render, _parentVnode } = vm.$options

  // reset _rendered flag on slots for duplicate slot check
  if (process.env.NODE_ENV !== 'production') {
    for (const key in vm.$slots) {
      // $flow-disable-line
      vm.$slots[key]._rendered = false
    }
  }

  if (_parentVnode) {
    vm.$scopedSlots = _parentVnode.data.scopedSlots || emptyObject
  }

  // set parent vnode. this allows render functions to have access
  // to the data on the placeholder node.
  vm.$vnode = _parentVnode
  // render self
  let vnode
  try {
    vnode = render.call(vm._renderProxy, vm.$createElement)
  } catch (e) {
    handleError(e, vm, `render`)
    // return error render result,
    // or previous vnode to prevent render error causing blank component
    /* istanbul ignore else */
    if (process.env.NODE_ENV !== 'production') {
      if (vm.$options.renderError) {
        try {
          vnode = vm.$options.renderError.call(vm._renderProxy, vm.$createElement, e)
        } catch (e) {
          handleError(e, vm, `renderError`)
          vnode = vm._vnode
        }
      } else {
        vnode = vm._vnode
      }
    } else {
      vnode = vm._vnode
    }
  }
  // return empty vnode in case the render function errored out
  if (!(vnode instanceof VNode)) {
    if (process.env.NODE_ENV !== 'production' && Array.isArray(vnode)) {
      warn(
        'Multiple root nodes returned from render function. Render function ' +
        'should return a single root node.',
        vm
      )
    }
    vnode = createEmptyVNode()
  }
  // set parent
  vnode.parent = _parentVnode
  return vnode
}
```

这段代码最核心的地方在于调用`render`函数，他直接调用了用户编写的`render`函数，我们一般写的模板模式，也需要在之前的`$mount`方法进行编译最终生成`render`函数。这就是之前说的Vue2.x最终渲染总是需要`render`函数。

在 Vue 的官方文档中介绍了 `render` 函数的第一个参数是 `createElement`，那么结合之前的例子：

```html
<div id="app">
  {{ message }}
</div>
```

相当于我们编写如下 `render` 函数：

```js
render: function (createElement) {
  return createElement('div', {
     attrs: {
        id: 'app'
      },
  }, this.message)
}
```

在上面例子中createElement实际上就是`vnode = render.call(vm._renderProxy, vm.$createElement)`中的`vm.$createElement`

## vm.$createElement
`vm.$createElement`实质是`createElement`函数，最终返回一个`vNode`。这当中`_c`是给模板编译使用，`$createElement`是给手写`render`函数使用。如下代码。

```js
export function initRender (vm: Component) {
  // ...
  // bind the createElement fn to this instance
  // so that we get proper render context inside it.
  // args order: tag, data, children, normalizationType, alwaysNormalize
  // internal version is used by render functions compiled from templates
  vm._c = (a, b, c, d) => createElement(vm, a, b, c, d, false)
  // normalization is always applied for the public version, used in
  // user-written render functions.
  vm.$createElement = (a, b, c, d) => createElement(vm, a, b, c, d, true)
}
```

## 总结
`render`函数通过执行传入的`vm.$createElement`函数最终返回一个vNode。`vm.$createElement`实际就是`createElement`函数。



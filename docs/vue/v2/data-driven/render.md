# render函数
`_render`函数最终返回的是一个`vnode`实例，在该函数中,最终执行的是`$options`上的`render`函数，将`vm.$createElement`函数作为参数传入。
```javascript
Vue.prototype._render = function (): VNode {
  const vm: Component = this
  const { render, _parentVnode } = vm.$options

  // 省略代码
  
  // render self
  let vnode
  try {
    vnode = render.call(vm._renderProxy, vm.$createElement)
  } catch (e) {
    // 省略代码
  }
  // 省略代码
  return vnode
}
```


Demo:
```javascript
<div id="app">
  {{ message }}
</div>
```
相当于手写`render`函数
```javascript
render: function (createElement) {
  return createElement('div', {
     attrs: {
        id: 'app'
      },
  }, this.message)
}
```

## $createElement函数
`vm.$createElement`定义于`initRender`函数，该函数在`vm`上定义了两个函数`_c`和`$createElement`，两个函数最终都指向`createElement`函数，仅最后一个标记不同。

`_c`和`$createElement`函数不同在于，`_c`是给经过模板编译后`render`函数用的，`$createElement`是给用户手写`render`函数用的。

```javascript
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


问题：那么`vnode = render.call(vm._renderProxy, vm.$createElement)`,`render`函数始终将`$createElement`函数作为传入，那么`_c`在哪里调用呢？

答：编译生成的`render`函数不同。
```javascript
// 用户手写
render: function (createElement) {
  return createElement('div', {
     attrs: {
        id: 'app'
      },
  }, this.message)
}

// Vue编译生成
render: function() {
  return this._c('div', {
    attrs: {
      id: 'app'
    },
  }, this.message);
}
```

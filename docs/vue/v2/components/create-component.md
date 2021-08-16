# createComponent

在之前我们知道Vue通过`render`函数，传入`createElement`函数，最终生成并返回`vnode`。在`createElement`函数中，如果传入的是组件对象，那么会调用`createComponent`函数，生成组件`vnode`。

`createComponent`函数创建组件`vnode`的创建总体分为三步：

1.组件构造函数的构建

2.安装组件钩子函数

3.实例化组件vnode

这三步是创建组件vnode的核心步骤。

## 组件构造函数的构建

```javascript
const baseCtor = context.$options._base

// plain options object: turn it into a constructor
if (isObject(Ctor)) {
  Ctor = baseCtor.extend(Ctor)
}
```

1.通过`$options._base`获取的实际是`Vue`，在Vue入口时执行了`initGlobalAPI`这个函数（注意是全局入口，并非_init函数初始化）。
```javascript
/// src/core/global-api/index.js
Vue.options._base = Vue
```
在`_init`函数中，执行了mergeOptions合并到`vm.$options`上。所以`baseCtor`实际上是Vue。

2.执行Vue.extend，返回子组件的构造。

首先先判断是否有缓存，当前组件已经有构造器，那么直接返回构造器，如果是初始化，那么就创建`_Ctor`对象。

然后通过原型继承的方式，生成一个继承于Vue的构造器`Sub`，并使其具有和Vue相同的能力，并且在其实例化时，执行`_init`函数。

最后，将此构造器`Sub`，缓存下来。下次进入进行判断。
```javascript
Vue.extend = function (extendOptions: Object): Function {
  extendOptions = extendOptions || {}
  const Super = this
  const SuperId = Super.cid
  const cachedCtors = extendOptions._Ctor || (extendOptions._Ctor = {})
  if (cachedCtors[SuperId]) {
    return cachedCtors[SuperId]
  }

  const name = extendOptions.name || Super.options.name
  if (process.env.NODE_ENV !== 'production' && name) {
    validateComponentName(name)
  }

  const Sub = function VueComponent (options) {
    this._init(options)
  }
  Sub.prototype = Object.create(Super.prototype)
  Sub.prototype.constructor = Sub
  Sub.cid = cid++
  Sub.options = mergeOptions(
    Super.options,
    extendOptions
  )
  Sub['super'] = Super

  // For props and computed properties, we define the proxy getters on
  // the Vue instances at extension time, on the extended prototype. This
  // avoids Object.defineProperty calls for each instance created.
  if (Sub.options.props) {
    initProps(Sub)
  }
  if (Sub.options.computed) {
    initComputed(Sub)
  }

  // allow further extension/mixin/plugin usage
  Sub.extend = Super.extend
  Sub.mixin = Super.mixin
  Sub.use = Super.use

  // create asset registers, so extended classes
  // can have their private assets too.
  ASSET_TYPES.forEach(function (type) {
    Sub[type] = Super[type]
  })
  // enable recursive self-lookup
  if (name) {
    Sub.options.components[name] = Sub
  }

  // keep a reference to the super options at extension time.
  // later at instantiation we can check if Super's options have
  // been updated.
  Sub.superOptions = Super.options
  Sub.extendOptions = extendOptions
  Sub.sealedOptions = extend({}, Sub.options)

  // cache constructor
  cachedCtors[SuperId] = Sub
  return Sub
}
```

## 安装组件钩子

执行`installComponentHooks(data)`函数，完成组件钩子的安装。在内部实际就是将`componentVNodeHooks`中的钩子函数，合并到`data.hook`上，在`patch`过程中，执行对应的钩子函数。

```javascript
const componentVNodeHooks = {
  init (vnode: VNodeWithData, hydrating: boolean): ?boolean {
    // .....省略代码
  }

  prepatch (oldVnode: MountedComponentVNode, vnode: MountedComponentVNode) {
    // .....省略代码
  }

  insert (vnode: MountedComponentVNode) {
    // .....省略代码
  }

  destroy (vnode: MountedComponentVNode) {
    // .....省略代码
  }
}

const hooksToMerge = Object.keys(componentVNodeHooks)

function installComponentHooks (data: VNodeData) {
  const hooks = data.hook || (data.hook = {})
  for (let i = 0; i < hooksToMerge.length; i++) {
    const key = hooksToMerge[i]
    const existing = hooks[key]
    const toMerge = componentVNodeHooks[key]
    if (existing !== toMerge && !(existing && existing._merged)) {
      hooks[key] = existing ? mergeHook(toMerge, existing) : toMerge
    }
  }
}

function mergeHook (f1: any, f2: any): Function {
  const merged = (a, b) => {
    // flow complains about extra args which is why we use any
    // 依次执行
    f1(a, b)
    f2(a, b)
  }
  merged._merged = true
  return merged
}
```

## 实例化vnode
实例化vnode很简单，就是将上面两步生成的值，实例化一个组件vnode返回（这里返回的是占位符vnode），其实比较重要的是该vnode接收的`componentOptions`这个对象。
```javascript
const name = Ctor.options.name || tag
const vnode = new VNode(
  `vue-component-${Ctor.cid}${name ? `-${name}` : ''}`,
  data, undefined, undefined, undefined, context,
  { Ctor, propsData, listeners, tag, children },
  asyncFactory
)
```

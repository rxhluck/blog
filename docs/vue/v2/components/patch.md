# 组件patch

在之前我们通过`createComponent`函数创建了组件vnode，接下来依旧是通过`_update`执行到`patch`，完成组件渲染为真实dom上。


一、执行`patch`函数中，`createElm`函数创建元素节点。（此时vnode可以理解为，初始化传入的App.vue）
```javascript
function createElm (
  vnode,
  insertedVnodeQueue,
  parentElm,
  refElm,
  nested,
  ownerArray,
  index
) {
  // ...
  if (createComponent(vnode, insertedVnodeQueue, parentElm, refElm)) {
    return
  }
  // ...
}
```

二、执行createComponent函数，首先判断`vnode`，是否含有`hook`以及`hook`是否含有`init`函数，并执行`hook`中的`init`钩子函数。
```javascript
function createComponent (vnode, insertedVnodeQueue, parentElm, refElm) {
  let i = vnode.data
  if (isDef(i)) {
    const isReactivated = isDef(vnode.componentInstance) && i.keepAlive
    if (isDef(i = i.hook) && isDef(i = i.init)) {
      i(vnode, false /* hydrating */)
    }
    // after calling the init hook, if the vnode is a child component
    // it should've created a child instance and mounted it. the child
    // component also has set the placeholder vnode's elm.
    // in that case we can just return the element and be done.
    if (isDef(vnode.componentInstance)) {
      initComponent(vnode, insertedVnodeQueue)
      insert(parentElm, vnode.elm, refElm)
      if (isTrue(isReactivated)) {
        reactivateComponent(vnode, insertedVnodeQueue, parentElm, refElm)
      }
      return true
    }
  }
}
```

三、`hook`中的`init`钩子函数，通过之前创建组件vnode时，通过`installComponentHooks`函数合并到，组件vnode.data.hook上，`init`钩子函数主要完成实例化子组件实例，并接管其渲染操作（接下来会慢慢聊到）。

```javascript
init (vnode: VNodeWithData, hydrating: boolean): ?boolean {
  if (
    vnode.componentInstance &&
    !vnode.componentInstance._isDestroyed &&
    vnode.data.keepAlive
  ) {
    // kept-alive components, treat as a patch
    const mountedNode: any = vnode // work around flow
    componentVNodeHooks.prepatch(mountedNode, mountedNode)
  } else {
    const child = vnode.componentInstance = createComponentInstanceForVnode(
      vnode,
      activeInstance
    )
    child.$mount(hydrating ? vnode.elm : undefined, hydrating)
  }
}
```

四、通过`createComponentInstanceForVnode`函数执行子组件实例创建。在这一步，定义了`_isComponent`为true表示为组件，`activeInstance`为当前占位符vnode的`parent`表示正在激活的实例，`_parentVnode`为占位符vnode。然后执行了`Ctor`构造器，生成子组件实例。
```javascript
export function createComponentInstanceForVnode (
  vnode: any, // we know it's MountedComponentVNode but flow doesn't
  parent: any, // activeInstance in lifecycle state
): Component {
  const options: InternalComponentOptions = {
    _isComponent: true,
    _parentVnode: vnode,
    parent
  }
  // check inline-template render functions
  const inlineTemplate = vnode.data.inlineTemplate
  if (isDef(inlineTemplate)) {
    options.render = inlineTemplate.render
    options.staticRenderFns = inlineTemplate.staticRenderFns
  }
  return new vnode.componentOptions.Ctor(options)
}
```

五、Ctor构造器是通过`createComponent`函数创建返回的`Sub`。最终会执行到`_init`函数。
```javascript
function createComponent() {
  // 省略代码
  const Sub = function VueComponent (options) {
    this._init(options)
  }
  // 省略代码
}
```


六、执行`this._init`依旧是`Vue.prototype._init`。这里有两步比较重要：
首先，通过`initInternalComponent`合并options配置到当前实例上。（步骤7）
然后，通过`initLifecycle`函数完成父子实例关系的建立。（步骤8）
```javascript
Vue.prototype._init = function (options?: Object) {
  const vm: Component = this
  // merge options
  if (options && options._isComponent) {
    // optimize internal component instantiation
    // since dynamic options merging is pretty slow, and none of the
    // internal component options needs special treatment.
    initInternalComponent(vm, options)
  } else {
    vm.$options = mergeOptions(
      resolveConstructorOptions(vm.constructor),
      options || {},
      vm
    )
  }
  // ...
  vm._self = vm;
  initLifecycle(vm);
  initEvents(vm);
  initRender(vm);
  callHook(vm, 'beforeCreate');
  initInjections(vm); // resolve injections before data/props
  initState(vm);
  initProvide(vm); // resolve provide after data/props
  callHook(vm, 'created');
  // ...

  if (vm.$options.el) {
    vm.$mount(vm.$options.el)
  } 
}
```

七、通过`initInternalComponent`函数合并配置到当前实例上。这一步，子组件实例`_parentVnode`为占位符vnode,`parent`为父组件实例。
```javascript
export function initInternalComponent (vm: Component, options: InternalComponentOptions) {
  const opts = vm.$options = Object.create(vm.constructor.options)
  // doing this because it's faster than dynamic enumeration.
  const parentVnode = options._parentVnode
  opts.parent = options.parent
  opts._parentVnode = parentVnode

  const vnodeComponentOptions = parentVnode.componentOptions
  opts.propsData = vnodeComponentOptions.propsData
  opts._parentListeners = vnodeComponentOptions.listeners
  opts._renderChildren = vnodeComponentOptions.children
  opts._componentTag = vnodeComponentOptions.tag

  if (options.render) {
    opts.render = options.render
    opts.staticRenderFns = options.staticRenderFns
  }
}
```

八、在`initLifecycle`函数中，完成父子实例关系的建立。
```javascript
function initLifecycle (vm) {
  var options = vm.$options;

  // locate first non-abstract parent
  var parent = options.parent;
  if (parent && !options.abstract) {
    while (parent.$options.abstract && parent.$parent) {
      parent = parent.$parent;
    }
    parent.$children.push(vm);
  }

  vm.$parent = parent;
  vm.$root = parent ? parent.$root : vm;

  vm.$children = [];
  vm.$refs = {};

  vm._watcher = null;
  vm._inactive = null;
  vm._directInactive = false;
  vm._isMounted = false;
  vm._isDestroyed = false;
  vm._isBeingDestroyed = false;
}

```

九、在上面两个步骤（7，8）都完成后，子组件Vue实例创建完成，但是因为在该`_init`函数中`$options.el`为空，所以不会执行`mount`操作，而是在之前的子组件占位符`vnode`的`init`钩子中，执行`child.$mount(hydrating ? vnode.elm : undefined, hydrating)`，子组件自己接手进行渲染。（第3步）


十、执行`child.$mount`实际，调用了`mountComponent`函数进行，在`mountComponent`函数，执行了`_update`函数以及`render`函数。
```javascript
updateComponent = () => {
  vm._update(vm._render(), hydrating)
}
```

十一、在执行`_render`函数时，这里是关键的几步。

第一步:vm.$vnode = _parentVnode: 将占位符vnode赋值给子组件的$vnode属性。

第二步:生成渲染vnode。

第三步:vnode.parent = _parentVnode: 将占位符vnode作为渲染vnode的父级。

在这三步后，完成了渲染vnode和占位符vnode的关系建立。
```javascript
Vue.prototype._render = function (): VNode {
  const vm: Component = this
  const { render, _parentVnode } = vm.$options

  
  // set parent vnode. this allows render functions to have access
  // to the data on the placeholder node.
  vm.$vnode = _parentVnode
  // render self
  let vnode
  try {
    vnode = render.call(vm._renderProxy, vm.$createElement)
  } catch (e) {
    // ...
  }
  // set parent
  vnode.parent = _parentVnode
  return vnode
}
```

十二、在执行`_update`函数时，主要完成了以下几步。

1.将父实例保存到prevActiveInstance,将activeInstance替换为当前正在激活的实例。主要是配合上面createComponentInstanceForVnode（第四步）完成父子组件实例关系建立。

2.对子组件实例vm._vnode = vnode属性赋值为渲染vnode。

3.当patch完成后，将activeInstance替换为父实例。这样就保证了实例化子组件时，activeInstance为父组件实例。

```javascript
Vue.prototype._update = function (vnode: VNode, hydrating?: boolean) {
  const vm: Component = this
  const prevEl = vm.$el
  const prevVnode = vm._vnode
  const prevActiveInstance = activeInstance
  activeInstance = vm
  vm._vnode = vnode
  // Vue.prototype.__patch__ is injected in entry points
  // based on the rendering backend used.
  if (!prevVnode) {
    // initial render
    vm.$el = vm.__patch__(vm.$el, vnode, hydrating, false /* removeOnly */)
  } else {
    // updates
    vm.$el = vm.__patch__(prevVnode, vnode)
  }
  activeInstance = prevActiveInstance
  // update __vue__ reference
  if (prevEl) {
    prevEl.__vue__ = null
  }
  if (vm.$el) {
    vm.$el.__vue__ = vm
  }
  // if parent is an HOC, update its $el as well
  if (vm.$vnode && vm.$parent && vm.$vnode === vm.$parent._vnode) {
    vm.$parent.$el = vm.$el
  }
  // updated hook is called by the scheduler to ensure that children are
  // updated in a parent's updated hook.
}
```

十三、通过执行`__patch__`函数，并传入渲染vnode，返回真实节点赋值给子组件实例`$el`，在patch函数中，因为当前传入的值为undefined，所以并不会有实际插入。实际插入实际在`createComponent`函数中执行。（步骤2）


十四、此时回到最开始的步骤二，先通过`initComponent`函数将子组件实例上`$el`放到占位符vnode上，再通过`insert`插入dom。
```javascript
function createComponent (vnode, insertedVnodeQueue, parentElm, refElm) {
  let i = vnode.data
  if (isDef(i)) {
    const isReactivated = isDef(vnode.componentInstance) && i.keepAlive
    if (isDef(i = i.hook) && isDef(i = i.init)) {
      i(vnode, false /* hydrating */)
    }
    // after calling the init hook, if the vnode is a child component
    // it should've created a child instance and mounted it. the child
    // component also has set the placeholder vnode's elm.
    // in that case we can just return the element and be done.
    if (isDef(vnode.componentInstance)) {
      initComponent(vnode, insertedVnodeQueue)
      insert(parentElm, vnode.elm, refElm)
      if (isTrue(isReactivated)) {
        reactivateComponent(vnode, insertedVnodeQueue, parentElm, refElm)
      }
      return true
    }
  }
}
```

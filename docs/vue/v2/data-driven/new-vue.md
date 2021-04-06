# new Vue 发生了什么
 
 ## Vue的本质
 通过`new`关键字用来实例化一个对象，Vue实际上是一个类，在JS中类通过Function来实现。具体代码在`src/core/instance/index.js`。
  ```js
  function Vue (options) {
    if (process.env.NODE_ENV !== 'production' &&
      !(this instanceof Vue)
    ) {
      warn('Vue is a constructor and should be called with the `new` keyword')
    }
    this._init(options)
  }
  ```
  在上面这段代码最后调用了_init方法进行初始化。
  
  ## 初始化做了什么
  具体_init方法执行了什么呢，他完成了合并配置，初始化生命周期，初始化事件中心，初始化渲染，初始化data，props，methods，watcher，computed等。如下代码。
  
   ```js
   Vue.prototype._init = function (options?: Object) {
     const vm: Component = this
     // a uid
     vm._uid = uid++
   
     let startTag, endTag
     /* istanbul ignore if */
     if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
       startTag = `vue-perf-start:${vm._uid}`
       endTag = `vue-perf-end:${vm._uid}`
       mark(startTag)
     }
   
     // a flag to avoid this being observed
     vm._isVue = true
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
     /* istanbul ignore else */
     if (process.env.NODE_ENV !== 'production') {
       initProxy(vm)
     } else {
       vm._renderProxy = vm
     }
     // expose real self
     vm._self = vm
     initLifecycle(vm)
     initEvents(vm)
     initRender(vm)
     callHook(vm, 'beforeCreate')
     initInjections(vm) // resolve injections before data/props
     initState(vm)
     initProvide(vm) // resolve provide after data/props
     callHook(vm, 'created')
   
     /* istanbul ignore if */
     if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
       vm._name = formatComponentName(vm, false)
       mark(endTag)
       measure(`vue ${vm._name} init`, startTag, endTag)
     }
   
     if (vm.$options.el) {
       vm.$mount(vm.$options.el)
     }
   }
   ```

   ## 总结
   Vue的本质是一个由Function实现的类。在new Vue的时候，执行了_init()函数，在_init函数中执行了合并配置，初始化生命周期，初始化事件中心，初始化渲染，初始化data，props，methods，watch，computed等。在最后会查看是否有el属性，并通过 `$mount` 函数，完成`vm`挂载，挂载的目标就是把模板渲染成最终的 DOM。
  
  

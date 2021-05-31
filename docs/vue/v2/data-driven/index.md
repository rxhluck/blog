## 数据驱动介绍
传统的前端开发，比如jQuery等库，都是通过js操作dom节点，进行页面数据操作，当页面特别数据交互特别复杂的时候逻辑会很混乱。Vue.js的核心在于数据驱动，通过数据去驱动视图的渲染，开发者只需要关心数据的变化。不用再去通过js操作dom从而更新视图。

## 数据驱动全流程
入口`new Vue()` —> 在Vue实例化时，执行`_init()` 函数进行初始化 —> `_init()`函数最后调用`vm.$mount(vm.$options.el)`进行渲染 —> 根据模式是否进行`compile`生成`render`函数 —> 执行`render`函数生成`vnode` —> 执行`_update`函数，通过`patch`函数渲染到页面上。

## 数据驱动流程图
<br />
<img :src="$withBase('/new-vue.png')"/>

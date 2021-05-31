# new Vue时发生了什么
1.Vue的本质是一个function,在new Vue时,会调用内部的`_init`函数进行初始化，并且在该文件中，会将混入一系列函数到`vm`上。

2.`_init()`函数执行做了以下几件事，合并配置，初始化生命周期，初始化事件中心，初始化渲染，初始化data，props，methods，computed，watcher等。

3.在初始化最后，检测是否有`el`属性，如果`el`属性就调用`vm.$mount`函数，去实现`vm`实例挂载，最终将模板渲染到页面上。

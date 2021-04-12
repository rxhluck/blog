# Virtual DOM

因为传统dom节点是很庞大的，在Vue中，Virtual DOM是使用js对dom的描述，只对关键属性进行描述，降低了创建dom的成本。它的核心定义无非就几个关键属性，标签名、数据、子节点、键值等。Virtual DOM仅仅只是dom的定义，他通过createElement函数生成，最后通过diff, patch渲染到页面上。

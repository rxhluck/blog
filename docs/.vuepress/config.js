module.exports = {
  title: 'FE知识总结',
  description: '仅仅只是任先森的个人知识总结，有错请指出，谢谢',
  port: '3333',
  serviceWorker: false,
  themeConfig: {
    search: false,
    nav: [{
      text: 'JS相关知识',
      link: '/js/base/'
    },
      {
        text: 'CSS布局',
        link: '/css/prepare/'
      },
      {
        text: 'Webpack',
        link: '/webpack/prepare'
      },
      {
        text: 'Vue源码分析',
        items: [{
          text: 'Vue2.0源码分析',
          // link: '/vue/v2/data-driven/'
          link: '/vue/v2/'
        },
          {
            text: 'Vue3.0源码分析',
            link: '/vue/v3/'
          }
        ]
      }, {
        text: 'React源码分析',
        link: '/react/prepare/'
      }, {
        text: '算法和数据结构',
        link: '/nodejs/prepare'
      }, {
        text: '网络协议',
        link: '/http/prepare'
      }, {
        text: '浏览器机制',
        link: '/explore/'
      }
    ],
    sidebar: {
      '/js/': [{
        title: 'JS相关知识',
        collapsable: false,
        children: [
          ['base/', '基础知识'],
          'base/closure',
          'base/prototype',
          'base/extends',
          'base/clone',
          'base/regexp'
        ]
      }, {
        title: 'ES2016',
        collapsable: false,
        children: [
          ['es6/', 'ES6基础知识'],
          'es6/expand',
          'es6/promise',
          'es6/generator'
        ]
      }, {
        title: '常见的前端函数',
        collapsable: false,
        children: [
          ['usual-function/', '节流和防抖'],
          'usual-function/sort',
          'usual-function/unique'
        ]
      }],
      '/vue/v2/': [{
        title: '简介',
        path: '/vue/v2/',
        collapsable: false,
      }, {
        title: '数据驱动',
        collapsable: false,
        children: [
          ['data-driven/', '什么是数据驱动'],
          'data-driven/new-vue',
          'data-driven/mounted',
          'data-driven/render',
          'data-driven/virtual-dom',
          'data-driven/create-element',
          'data-driven/update'
        ]
      }, {
        title: '组件化',
        collapsable: false,
        children: [
          ['components/', '什么是组件化'],
          'components/create-component',
          'components/patch'
        ]
      }],
      '/explore/': [{
        title: '浏览器机制',
        collapsable: false,
        children: [
          '垃圾回收机制'
        ]
      }]
    }
  }
}

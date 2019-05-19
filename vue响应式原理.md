
谈谈阅读了vue`深入响应式原理`后的理解
###  1.响应式原理
在生成vue实例时，为对传入的data进行遍历，使用`Object.defineProperty`把这些属性转为`getter/setter`.

`Object.defineProperty` 是 ES5 中一个无法 shim 的特性，这也就是 Vue 不支持 IE8 以及更低版本浏览器的原因。

每个vue实例都有一个watcher实例，它会在实例渲染时记录这些属性，并在setter触发时重新渲染。

![image.png](https://upload-images.jianshu.io/upload_images/6828981-85b9ce36f84afda7.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

Vue 无法检测到对象属性的添加或删除

Vue 不允许动态添加根级别的响应式属性。但是，可以使用 `Vue.set(object, propertyName, value) `方法向嵌套对象添加响应式属性。

### 2.声明响应式属性

由于 Vue 不允许动态添加根级响应式属性，所以你必须在初始化实例前声明所有根级响应式属性，哪怕只是一个空值。


如果你未在 data 选项中声明 message，Vue 将警告你渲染函数正在试图访问不存在的属性。

###  3.异步更新队列

vue更新dom时是异步执行的

数据变化、更新是在主线程中同步执行的；在侦听到数据变化时，watcher将数据变更存储到异步队列中，当本次数据变化，即主线成任务执行完毕，异步队列中的任务才会被执行（已去重）。

如果你在js中更新数据后立即去操作DOM，这时候DOM还未更新；vue提供了nextTick接口来处理这样的情况，它的参数是一个回调函数，会在本次DOM更新完成后被调用。


使用方法：
* 1.在组件内使用 vm.$nextTick() 实例方法特别方便，因为它不需要全局 Vue，并且回调函数中的 this 将自动绑定到当前的 Vue 实例上：

```js
Vue.component('example', {
  template: '<span>{{ message }}</span>',
  data: function () {
    return {
      message: '未更新'
    }
  },
  methods: {
    updateMessage: function () {
      this.message = '已更新'
      console.log(this.$el.textContent) // => '未更新'
      this.$nextTick(function () {
        console.log(this.$el.textContent) // => '已更新'
      })
    }
  }
})
```

*  2.因为 `$nextTick()` 返回一个 `Promise` 对象，所以你可以使用新的 [ES2016 async/await](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Statements/async_function) 语法完成相同的事情：

```js
methods: {
  updateMessage: async function () {
    this.message = '已更新'
    console.log(this.$el.textContent) // => '未更新'
    await this.$nextTick()
    console.log(this.$el.textContent) // => '已更新'
  }
}
```

>jQuery框架的核心就是从HTML文档中匹配元素并对其执行操作

```js

//例如
$().find().css()
$().hide().html('...').show()

```

从上面的写法至少可以发现2个问题：
1.jQuery对象的构建方式
2.jQuery方法的调用方式

### 1.jQuery的无new构建

JavaScript是函数式语言，函数可以实现类，类就是面向对象编程中最基本的概念

```js

var aQuery = function(selector, context) {
    //构造函数
}
aQuery.prototype = {
    //原型
    name: function() {},
    age: function() {},
}

var $ = new aQuery();

$.name

```

这是构造函数常规的使用方法，jQuery显然与此不同

jQuery没有使用new运算符显示的实例化，而是直接调用其函数

```js

$().ready()
$().noConflict()

```

要实现这样，那么$()应该是返回类的实例，所以把代码改一下：

```js

var aQuery = function(selector, context) {
    return new aQuery();
}
aQuery.prototype = {
    //原型
    name: function() {},
    age: function() {},
}

```

通过`new aQuery()`，虽然返回的是一个实例，但是也有明显的问题，死循环了。

如何返回一个正确的实例，可以把jQuery类当作一个工厂方法来创建实例，把这个方法放到jQuery.prototype
返回的是aQuery.prototype
```js
var aQuery = function(selector, context) {
    return aQuery.prototype.init();
}
aQuery.prototype = {
    //原型
    init: function() {
        return this;
    },
    name: function() {},
    age: function() {},
}
```

这样的话也会有问题，每次设置实例的this都会覆盖aQuery.prototype，每个实例都没有独立的属性
所以要设计独立的作用域才行

jQuery框架分隔作用域的处理
```js
jQuery = function (selector, context) {

    // The jQuery object is actually just the init constructor 'enhanced'
    // Need init if jQuery is called (just allow error to be thrown if not included)
    return new jQuery.fn.init(selector, context);
}
```
很明显通过实例init函数，每次都构建新的init实例对象，来分隔this,避免交互混淆
但是实例和jQuery的原型分离了，会出现新的问题

例如：

```js
var aQuery = function(selector, context) {
       return  new aQuery.prototype.init();
}
aQuery.prototype = {
    init: function() {
        this.age = 18
        return this;
    },
    name: function() {},
    age: 20
}

//Uncaught TypeError: Object [object Object] has no method 'name' 
console.log(aQuery().name())
```
怎么访问jQuery类原型上的属性和方法？做到既能隔离作用域还能使用jQuery的原型的作用域呢，能在返回实例中访问jQuery的原型对象。
实现关键点:
```js
// Give the init function the jQuery prototype for later instantiation
jQuery.fn.init.prototype = jQuery.fn;
```
通过原型传递解决问题，把jQuery原型传递给jQuery.prototype.init.prototype
换句话说jQuery的原型对象覆盖了init构造器的原型对象
```js
var aQuery = function(selector, context) {
       return  new aQuery.prototype.init();
}
aQuery.prototype = {
    init: function() {
        return this;
    },
    name: function() {
        return this.age
    },
    age: 20
}

aQuery.prototype.init.prototype = aQuery.prototype;

console.log(aQuery().name()) //20
```
fn没有什么特殊的意思，只是jQuery.prototype的引用
![jQuery结构](http://dl.iteye.com/upload/attachment/0073/2601/3fc8106d-6afd-314c-a6bf-a64157145e67.jpg)

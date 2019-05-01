>jQuery框架的核心就是从HTML文档中匹配元素并对其执行操作

```

//例如
$().find().css()
$().hide().html('...').show()

```

从上面的写法至少可以发现2个问题：
1.jQuery对象的构建方式
2.jQuery方法的调用方式

### 1.jQuery的无new构建

JavaScript是函数式语言，函数可以实现类，类就是面向对象编程中最基本的概念

```

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

```

$().ready()
$().noConflict()

```

要实现这样，那么$()应该是返回类的实例，所以把代码改一下：

```

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
```
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

```文同
```

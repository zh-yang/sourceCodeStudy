#### 1.在jQuery入口函数$(selector, context)源码中

当selector为dom字符串时，jQuery生成dom时分两种情况：
1.单标签类型：如<div></div>，直接createElement()返回
2.多标签复合类型，由buildFragment函数处理

在 jQuery3.0中，buildFragment 是一个私有函数，用来构建一个包含子节点 fragment 对象。
这个 fragment 在 DOM1 中就已经有了，所有浏览器都支持。当频繁操作(添加、插入) DOM 时使用该方法可以提高性能

jQuery3.0 中 buildFragment 只在 domManip 和 jQuery.parseHTML 中使用，
domManip 则被 DOM 操作如 append、prepend、before、after 等方法的所依赖。

在jQuery.buildFragment()中使用一下工具函数：

1.toType

如果是null则返回null
如果typeof返回object或function，使用对象的toString方法返回字符串标示类型
其他基本类型直接用typeof判断

```js
var class2type = {};

var toString = class2type.toString;

var hasOwn = class2type.hasOwnProperty;

function toType(obj) {
    if (obj == null) {
        return obj + "";
    }

    // Support: Android <=2.3 only (functionish RegExp)
    return typeof obj === "object" || typeof obj === "function" ?
        class2type[toString.call(obj)] || "object" :
        typeof obj;
}



```

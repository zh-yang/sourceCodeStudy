#### jQuery框架的基础就是查询，查询文当选素，所以狭隘的说，jQuery就是一个选择器，并在这个基础上构建和运行查询过滤器

### 1.jQuery实例核心函数

```js
// A central reference to the root jQuery(document)
    var rootjQuery,

        // A simple way to check for HTML strings
        // Prioritize #id over <tag> to avoid XSS via location.hash (#9521)
        // Strict HTML recognition (#11290: must start with <)
        // Shortcut simple #id case for speed
        rquickExpr = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]+))$/,

        init = jQuery.fn.init = function (selector, context, root) {
            var match, elem;

            // HANDLE: $(""), $(null), $(undefined), $(false)
            if (!selector) {
                return this;
            }

            // Method init() accepts an alternate rootjQuery
            // so migrate can support jQuery.sub (gh-2101)
            root = root || rootjQuery;
            
            //Handle html strings
            if (typeof selector === "string") {
                //这里来处理各种选择器，新建dom等
                //主要用来上边定义的正则rquickExpr
                ...
            } else if (selector.nodeType) {
                this[0] = selector;
                this.length = 1;
                return this;

                // HANDLE: $(function)
                // Shortcut for document ready
            } else if (isFunction(selector)) {
                return root.ready !== undefined ?
                    root.ready(selector) :

                    // Execute immediately if ready is not present
                    selector(jQuery);
            }

            return jQuery.makeArray(selector, this);
        };
    // Give the init function the jQuery prototype for later instantiation
    init.prototype = jQuery.fn;

    // Initialize central reference
    rootjQuery = jQuery(document);

```

可以看出jQuery在实例化时对参数selector进行了五种分类处理
* 1.传入参数布尔转换为false时直接`return this`，返回空对象实例，拥有jQuery原型的所有方法。
* 2.当参数为string类型时，这种情况最为复杂，也是我们最常用的方法，进行各种dom操作。
* 3.拥有nodeType属性的原生DOM，被包装成jQuery元素返回。
* 4.参数为函数是，一般的浏览器会调用root.ready(selector)
* 5.其他情况，参数为数组，对象，jQuery原属等，由jQuery.makeArray()处理

### 2.核心函数对string的处理

首先要理解核心正则：` rquickExpr = /^(\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/ `

分解：通过|分割，匹配两种情况
* 1./^(\s*(<[\w\W]+>)[^>]*)$/

(?:pattern) : 匹配 pattern 但不获取匹配结果，也就是说这是一个非获取匹配，不进行存储供以后使用

\s* : 匹配任何空白字符，包括空格、制表符、换页符等等 零次或多次 等价于{0,}

(pattern) : 匹配pattern 并获取这一匹配。所获取的匹配可以从产生的 Matches 集合得到，使用 $0…$9 属性

[\w\W]+ : 匹配于'[A-Za-z0-9_]'或[^A-Za-z0-9_]' 一次或多次， 等价{1,}

(<[wW]+>) :这个表示字符串里要包含用<>包含的字符，例如`<p>,<div>`等等都是符合要求的
    
[^>]* : 负值字符集合,字符串尾部是除了>的任意字符或者没有字符,零次或多次等价于{0,},


* 2./^(#([\w-]*))$/

匹配结尾带上#号的任意字符，包括下划线与-

#### 所以综合起来呢大概的意思就是：匹配HTML标记和ID表达式（<前面可以匹配任何空白字符，包括空格、制表符、换页符等等）

测试：
```js
var str = ' <div id=top></div>';
var match = rquickExpr.exec(str);
console.log(match)
//[" <div id=top></div>", "<div id=top></div>", undefined, index: 0, input: " <div id=top></div>"]

var str = '#test';
var match = rquickExpr.exec(str);
console.log(match)
//["#test", undefined, "test", index: 0, input: "#test"]

//由于使用了正则分组，所以返回数组为匹配到的字符串分组：
//注意：第一分组已经被忽略，其实他和match返回的第一元素值相同

//当匹配dom元素时
//第一元素：匹配到的整个string，包括空字符
//第二元素：匹配到的dom结构，去除了<之前的空字符以及>之后的所有字符
//第三元素：undefined，由于第三元素用来匹配ID，所以这里为undefined


//当匹配id时：
//第一元素：匹配到的整个string，包括#
//第二元素：undefined
//第三元素：返回ID
```

#### 查看jQuery处理string的源码
```js
// Handle HTML strings
if (typeof selector === "string") {
    if (selector[0] === "<" &&
        selector[selector.length - 1] === ">" &&
        selector.length >= 3) {

        // Assume that strings that start and end with <> are HTML and skip the regex check
        match = [null, selector, null];

    } else {
        match = rquickExpr.exec(selector);
    }

    // Match html or make sure no context is specified for #id
    if (match && (match[1] || !context)) {

        // HANDLE: $(html) -> $(array)
        if (match[1]) {
            //处理html
            ...
        } else {
            elem = document.getElementById(match[2]);

            if (elem) {

                // Inject the element directly into the jQuery object
                this[0] = elem;
                this.length = 1;
            }
            return this;
        }
    // HANDLE: $(expr, $(...))
    } else if (!context || context.jquery) {
        return (context || root).find(selector);

        // HANDLE: $(expr, context)
        // (which is just equivalent to: $(context).find(expr)
    } else {
        return this.constructor(context).find(selector);
    }
}
```
场景分析：
```js
//jQuery入口选择器API为$(selector, context)
//其中selector可匹配三种情况，1.html字符串2.类选择器3.ID选择器
//context为附加的上下文，只有当selector匹配选择器时起作用。
```

#### 匹配模式一：$("#id")

1.进入字符串处理
```js
if ( typeof selector === "string" ) {
```

2.如果是以`<`开头，以`>`结尾且长度大于3的情况，直接跳过正则验证，直接`match = [null,selector,null]`

3.否则的话需要`match = rquickExpr.exec( selector )`

4.匹配的html或确保没有上下文指定为# id
```js
if ( match && (match[1] || !context) ) {
```

5.match[1]存在，处理(html)−>(array),,也就是处理的是html方式

6.处理ID
```js
elem = document.getElementById(match[2]);

if (elem) {

    // Inject the element directly into the jQuery object
    this[0] = elem;
    this.length = 1;
}

    //this.context = document;
    //this.selector = selector;
    //jQuery3.x已经去除了这两个属性

return this;
```

#### 匹配模式二：<htmltag>

源码：
```js
// HANDLE: $(html) -> $(array)
if (match[1]) {
    context = context instanceof jQuery ? context[0] : context;

    // Option to run scripts is true for back-compat
    // Intentionally let the error be thrown if parseHTML is not present
    jQuery.merge(this, jQuery.parseHTML(
        match[1],
        context && context.nodeType ? context.ownerDocument || context : document,
        true
    ));

    // HANDLE: $(html, props)
    if (rsingleTag.test(match[1]) && jQuery.isPlainObject(context)) {
        for (match in context) {

            // Properties of context are called as methods if possible
            if (isFunction(this[match])) {
                this[match](context[match]);

                // ...and otherwise set as attributes
            } else {
                this.attr(match, context[match]);
            }
        }
    }

    return this;

    // HANDLE: $(#id)
}
```
1.首先处理context，如果是jQuery元素转换为原生DOM

2.使用jQuery.parseHtml()返回解析的DOM数组，然后使用jQuery.merge()进行合并

* ownerDocument和 documentElement的区别

```js
context && context.nodeType ? context.ownerDocument || context : document
//如果context不存在或者context不是DOM，返回document
//如果是DOM分两种情况：1.是document，直接返回2.是其他DOM，返回context.ownerDocument
```

* jQuery.parseHTML

```js
jQuery.parseHTML = function (data, context, keepScripts) {
    //data非string类型
    if (typeof data !== "string") {
        return [];
    }
    //context布尔类型
    if (typeof context === "boolean") {
        //是否执行脚本
        keepScripts = context;
        context = false;
    }

    var base, parsed, scripts;

    if (!context) {
        //context不存在
        // Stop scripts or inline event handlers from being executed immediately
        // by using document.implementation
        if (support.createHTMLDocument) {
            //如果浏览器支持document.implementation.createHTMLDocument
            //新建一个document，提升安全性
            context = document.implementation.createHTMLDocument("");

            // Set the base href for the created document
            // so any parsed elements with URLs
            // are based on the document's URL (gh-2965)
            base = context.createElement("base");
            base.href = document.location.href;
            context.head.appendChild(base);
        } else {
            //否则返回当前documentent
            context = document;
        }
    }
    //匹配单标签，如<a></a>
    parsed = rsingleTag.exec(data);
    //是否执行脚本
    scripts = !keepScripts && [];

    // Single tag
    if (parsed) {
        //单标签直接创建并返回
        return [context.createElement(parsed[1])];
    }

    parsed = buildFragment([data], context, scripts);

    if (scripts && scripts.length) {
        jQuery(scripts).remove();
    }

    return jQuery.merge([], parsed.childNodes);
};
```

* jQuery.merge

```js
// Support: Android <=4.0 only, PhantomJS 1 only
// push.apply(_, arraylike) throws on ancient WebKit
merge: function (first, second) {
    var len = +second.length,
        j = 0,
        i = first.length;

    for (; j < len; j++) {
        first[i++] = second[j];
    }

    first.length = i;

    return first;
}
```


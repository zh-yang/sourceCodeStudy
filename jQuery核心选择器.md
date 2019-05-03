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
```

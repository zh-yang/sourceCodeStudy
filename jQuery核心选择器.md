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

```

可以看出jQuery在实例化时对参数selector进行了五种分类处理
* 1.传入参数布尔转换为false时直接`return this`，返回空对象实例，拥有jQuery原型的所有方法。

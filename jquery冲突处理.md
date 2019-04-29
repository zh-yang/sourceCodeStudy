### 1.jQuery默认给浏览器环境添加$和jQuery
```
//jQuery源码截取
// Expose jQuery and $ identifiers, even in AMD
// (#7102#comment:10, https://github.com/jquery/jquery/pull/557)
// and CommonJS for browser emulators (#13566)
if ( !noGlobal ) {
	window.jQuery = window.$ = jQuery;
}
```
### 2.jQuery标识符冲突分为两种场景：
```
//index.js
...
var $ = 'my-jq'
...

//场景1.jQuery覆盖其他文件$或jQuery
<!DOCTYPE html>
<html lang="en">
<head>
    <script src="./index.js"></script>
    <script src="./jquery.js"></script>
</head>
</html>

//场景2.其他文件覆盖jQuery$或jQuery
<!DOCTYPE html>
<html lang="en">
<head>
    <script src="./jquery.js"></script>
	<script src="./index.js"></script>
</head>
</html>
```
### 3.解决标识符冲突问题

jQuery提供了核心方法noConflict解决标识符冲突以及重新命名标识符：

当冲突为场景1时：
```
$.noConflict()
//或
jQuery.noConflict()
//将window.$赋值给其他文件的$，jQuery通过window.jQuery调用
```

当冲突为场景2时：
```
//此时其他文件的$覆盖了jQuery的$
//jQuery通过window.jQuery调用
//加入$和jQuery被同时覆盖，将无法使用jQuery，尽量避免这种情况发生
```

以上两种情况都可以重新定义jQuery标识符：
```
var jq=$.noConflict();
//或
var jq=jQuery.noConflict();
```

noConflict方法源码实现：
```
var

	// Map over jQuery in case of overwrite
	_jQuery = window.jQuery,

	// Map over the $ in case of overwrite
	_$ = window.$;

jQuery.noConflict = function( deep ) {
	if ( window.$ === jQuery ) {
		window.$ = _$;
	}

	if ( deep && window.jQuery === jQuery ) {
		window.jQuery = _jQuery;
	}

	return jQuery;
};
```

把其他文件的$、jQuery关键字通过_$、_jQuery存储起来，在调用noConflict方法时重新赋值

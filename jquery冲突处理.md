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
### 2.jQuery标识符冲突分为两种情况：


//以下内容都是关于在nodejs中的this而非javascript中的this，nodejs中的this和在浏览器中javascript中的this是不一样的。

//在全局中的this


console.log(this); {}
this.num = 10;
console.log(this.num); 10
console.log(global.num); undefined
//全局中的this默认是一个空对象。并且在全局中this与global对象没有任何的关系，那么全局中的this究竟指向的是谁？在本章节后半部分我们会讲解。

在函数中的this


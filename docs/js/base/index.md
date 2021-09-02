# JS基础知识
### JS的数据类型有8种。Number、String、Boolean、Null、undefined、Object、symbol、bigInt。

## 原始数据类型
在 JS 中，存在着 6 种原始值，分别是：`boolean`、`string`、`number`、`null`、`undefined`、`symbol`；
原始类型存储的都是值，没有函数可以调用，比如`undefined.toString();`（如下图）

<div align=center>
    <img :src="$withBase('/assets/baseJs/basejs_1.png')"/>
</div>

**那么问题来了为什么在代码中可以使用'1'.toString()呢？**

原因：在使用基本类型变量以对象方式使用，比如增加属性等时，实际相当于`new String(a);`
但是当使用完时，临时对象会被销毁。同理`Number`与`Boolean`一样。（讲白了也就是包装类型）

```javascript
var  a = 'string';
console.log(a.length) // 6
a.t = 10 // 10
console.log(a.t) // undefined
```

**面试题：涉及面试题：原始类型有哪几种？null 是对象嘛？**

对于 `null` 来说，很多人会认为他是个对象类型，其实这是错误的。虽然 `typeof null `会输出 `object`，但是这只是 `JS` 存在的一个悠久 `Bug`。在 `JS` 的最初版本中使用的是 32 位系统，为了性能考虑使用低位存储变量的类型信息，000 开头代表是对象，然而 `null` 表示为全零，所以将它错误的判断为 `object` 。虽然现在的内部类型判断代码已经改变了，但是对于这个 Bug 却是一直流传下来。


## 对象（Object）类型
**面试题：对象类型和原始类型的不同之处？**

在 JS 中，除了原始类型那么其他的都是对象类型了。对象类型和原始类型不同的是，原始类型存储的是值，对象类型存储的是地址（指针）。当你创建了一个对象类型的时候，计算机会在内存中帮我们开辟一个空间来存放值，但是我们需要找到这个空间，这个空间会拥有一个地址（指针）。


**面试题：函数参数是对象会发生什么问题？**
```javascript
function test(person) {
  person.age = 26
  person = {
    name: 'yyy',
    age: 30
  }

  return person
}
const p1 = {
  name: 'yck',
  age: 25
}
const p2 = test(p1)
console.log(p1) // -> ?
console.log(p2) // -> ?
```
答：会输出不同的值。

1.首先函数传递的是指针副本；<br />
2.person.age=26时，p1的值发生改变；<br />
3.当person = {xxxx}时，相当于在存储空间中开辟了新空间，所以最后输出的值不一致；

所以最后 person 拥有了一个新的地址（指针），也就和 p1 没有任何关系了，导致了最终两个变量的值是不相同的。

<div align=center>
    <img :src="$withBase('/assets/baseJs/basejs_2.png')"/>
</div>


## typeof vs instanceof
**面试题：typeof 是否能正确判断类型？不能。**

`typeof` 对于原始类型来说，除了 `null` 都可以显示正确的类型；

`typeof` 对于对象来说，除了函数都会显示 `object`，所以说 `typeof` 并不能准确判断变量到底是什么类型；

```javascript
typeof 1 // 'number'
typeof '1' // 'string'
typeof undefined // 'undefined'
typeof true // 'boolean'
typeof Symbol() // 'symbol'
typeof null // 'object'这是错误的

typeof [] // 'object'
typeof {} // 'object'
typeof console.log // 'function'
```

**面试题：`instanceof` 能正确判断对象的原理是什么？**<br/>
答：通过原型链来判断的；如果我们想判断一个对象的正确类型，这时候可以考虑使用 `instanceof`，因为内部机制是通过原型链来判断的；
```javascript
const Person = function() {}
const p1 = new Person()
p1 instanceof Person // true

var str = 'hello world'
str instanceof String // false

var str1 = new String('hello world')
str1 instanceof String // true
```
对于原始类型通过`instanceof`是无法判断，当然我们还是有办法让 instanceof 判断原始类型的；

```javascript
class PrimitiveString{
    static [Symbol.hasInstance](x) {
        return typeof x === 'string';
    }
}
console.log('hello world' instanceof PrimitiveString) // true
```

你可能不知道 Symbol.hasInstance 是什么东西，其实就是一个能让我们自定义 instanceof 行为的东西，以上代码等同于 typeof 'hello world' === 'string'，所以结果自然是 true 了。这其实也侧面反映了一个问题， instanceof 也不是百分之百可信的。

## 类型转换
首先我们要知道，在 JS 中类型转换只有三种情况，分别是：

1.转换为布尔值

2.转换为数字

3.转换为字符串

<div align=center>
    <img :src="$withBase('/assets/baseJs/basejs_3.png')"/>
</div>

**自动转换为Boolean**

在条件判断时（比如if(),三目运算符），除了 undefined， null， false， NaN， ''， 0， -0，其他所有值都转为 true，包括所有对象。

**自动转换为字符串**

当使用`+`二元运算符时，如果一个值为字符串，另一个值为非字符串，则后者转为字符串。

```javascript
'5' + 1 // '51'
'5' + true // "5true"
'5' + false // "5false"
'5' + {} // "5[object Object]"
'5' + [] // "5"
'5' + function (){} // "5function (){}"
'5' + undefined // "5undefined"
'5' + null // "5null"
```

**自动转换为数值**

JavaScript 遇到预期为数值的地方，就会将参数值自动转换为数值。系统内部会自动调用Number函数。
除了加法运算符（+）有可能把运算子转为字符串，其他运算符都会把运算子自动转成数值。
```javascript
'5' - '2' // 3
'5' * '2' // 10
true - 1  // 0
false - 1 // -1
'1' - 1   // 0
'5' * []    // 0
'5' * [1, 2, 3] // NaN
false / '5' // 0
'abc' - 1   // NaN
null + 1 // 1
undefined + 1 // NaN
```

**对象转原始类型：**

对象在转换类型的时候，会调用内置的 `[[ToPrimitive]]` 函数，对于该函数来说，算法逻辑一般来说如下：

1.如果已经是原始类型了，那就不需要转换了。

2.如果需要转字符串类型就调用`x.toString()`，转换为基础类型的话就返回转换的值。不是字符串类型的话就先调用 `valueOf`，结果不是基础类型的话再调用 `toString`，调用 `x.valueOf()`。

3.如果转换为基础类型，就返回转换的值

4.如果都没有返回原始类型，就会报错，当然你也可以重写 `Symbol.toPrimitive` ，该方法在转原始类型时调用优先级最高。


```javascript
let a = {
  valueOf() {
    return 0
  },
  toString() {
    return '1'
  },
  [Symbol.toPrimitive]() {
    return 2
  }
}
1 + a // => 3
```


**一元运算符和二元运算符：**

一元运算符：都将值转换为数字进行等式运算
```javascript
+1
-1
```

二元加法：

1.有字符串做字符串拼接

2.没有字符串都转为数字做操作

3.引用数据类型都转为基本数据类型，再做加法

二元减法：都转换为数字


**比较运算符：**

1.如果是对象，就通过 toPrimitive 转换对象

2.如果是字符串，就通过 unicode 字符索引来比较

```javascript
let a = {
  valueOf() {
    return 0
  },
  toString() {
    return '1'
  }
}
a > -1 // true
```
在以上代码中，因为 `a` 是对象，所以会通过 `valueOf` 转换为原始类型再比较值。

**注意点：**

[https://segmentfault.com/q/1010000008352957?sort=created#comment-area](https://segmentfault.com/q/1010000008352957?sort=created#comment-area)

```javascript
1+{} // 1[object Object]
{} + 1 // 1
console.log(1+{}) // 1[object Object]
console.log({}+1) //1
```

为什么{} + 1输出结果为1呢， 因为在JS解析器中{}为代码块并不为对象

```javascript
{} + {} // 在FF,IE浏览器为NaN
{} + {} // 在Chrome中为[Object][Object]
({} + {}) // ()内表示为二元运算符，前后都为值
// 个人目前认为NaN合理，因为都是要转为Number进行计算
```

## == vs ===

1.首先会判断两者类型是否相同。相同的话就是比大小了

2.类型不相同的话，那么就会进行类型转换

3.会先判断是否在对比 null 和 undefined，是的话就会返回 true

4.判断两者类型是否为 string 和 number，是的话就会将字符串转换为 number
````javascript
1 == '1'
      ↓
1 ==  1
````

5.判断其中一方是否为 boolean，是的话就会把 boolean 转为 number 再进行判断

```javascript
'1' == true
        ↓
'1' ==  1
        ↓
 1  ==  1
```
6.判断其中一方是否为 object 且另一方为 string、number 或者 symbol，是的话就会把 object 转为原始类型再进行判断
```javascript
'1' == { name: 'rxh' }
        ↓
'1' == '[object Object]'
```

**问：[] == ![]为true，{} == !{} 为false**

答：

1.!优先级大于==，所以优先执行取反操作，除了null，undefined，NaN以及空字符串，其余取反均为false，所以等式变为 [] == false;

2.如果为boolean值则转换为number类型，[] == 0;

3.[]并不是基础数据类型，所以会尝试转换为基础数据类型，[].toString() 变为 '',所以等式变味了'' == 0
4.字符串会转换0，所以为true；

{} == ! {}   ->   {} == false  ->  {} == 0  ->   NaN == 0    ->  false


## 闭包
闭包：函数内部能访问到外部变量，内部的私有变量不会污染外部变量

实现一个链式调用函数：
```javascript
function Parent(a) {
    return function (b) {
        console.log(a+b);
    }
}
Parent(1)(2);
```
循环中使用闭包解决 `var` 定义函数的问题：

```javascript
for (var i = 1; i <= 5; i++) {
  setTimeout(function timer() {
    console.log(i)
  }, i * 1000)
}
// 6,6,6,6,6此时输出5个6

for(var i = 0; i <= 5; i++) {
    (function (j) {
        setTimeout(() => {
            console.log(j);
        }, j * 1000)
    })(i)
}
```

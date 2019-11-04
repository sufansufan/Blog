# Blog
## javaScript
### 原型继承和Class继承
#### 组合继承
这种优点就是构造函数里面可以传参数，不会与父类引用属性共享，可以复用父类的函数，但是存在一个缺点继承父类函数的时候调用了父类的构造函数，导致子类的原型上多了不需要的父类属性，存在内存上面的浪费
~~~
function Parent(value) {
  this.value = value;
}

Parent.prototype.getValue = function () {
  console.log(this.value)
}

function Child(value) {
  Parent.call(this, value)
}

Child.prototype = new Parent()
const child = new Child(1)
child.getValue()
~~~

#### 寄生组合继承
这种继承方式对组合继承进行优化，组合继承缺点就是继承父类时调用了父类的构造函数，我们只需要把这一方面优化掉就ok了。
以上继承实现的核心就是将父类的原型赋值给子类，并且将构造函数设置为子类，这样解决了无用的父类属性问题，这样能正确的找到子类的构造函数

~~~
function Parent(value) {
  this.value = value
}

Parent.prototype.getValue = function() {
  console.log(this.value)
}

function Child(value) {
  Parent.call(this, value)
}

Child.prototype = Object.create(Parent.prototype, {
  constructor: {
    value: Child,
    enumerable: false,
    writable: true,
    configurable: true
  }
})

const child = new Child(1)
child.getValue()
~~~

#### class继承
class 实现继承的核心在于使用 extends 表明继承自哪个父类，并且在子类构造函数中必须调用 super，因为这段代码可以看成 Parent.call(this, value)。
~~~
class Parent {
  constructor(value){
    this.value = value;
  }
  getValue() {
    console.log(this.value)
  }
}

class Child extends Parent {
  constructor(value) {
    super(value)
  }
}

let child = new Child(1)
child.getValue()
~~~

#### 原型链继承
将父类的实例做为子的原型
特点
- 实例的构造函数的属性
- 父类构造函数的属性
- 父类原型的属性
缺点
- 实例无法向父类构造函数进行传参
- 继承单一
- 所有新实例都会共享父类实例的属性
~~~
function Parent(name) {
  this.name = '222';
  this.num = function () {
    console.log(111111)
  }
}
Parent.prototype.age = 10;

function Child() {
  this.name = 'sufan'
}
Child.prototype = new Parent()
const child = new Child()
console.log(child.age)
~~~

#### 构造继承
使用父类的构造函数来增强子类的实例，等于是复制父类的实例属性给子类

~~~
function Parent(name) {
  this.name = name
  this.num = function () {
    console.log(111111)
  }
}
Parent.prototype.age = 10;

function Child(name) {
  Parent.call(this, name)
}
const child = new Child('lisi')
console.log(child.name)
~~~
特点：
- 只是继承父类构造函数的属性，没有继承父类原型的属性
- 解决原型链继承的缺点: 实例无法向父类构造函数进行传参、继承单一、 所有的新实例都会共享父类实例的属性

缺点:
- 只能继承父类构造函数的属性
- 无法实现构造函数的复用
- 每一个新实例都有父类构造函数的副本，臃肿

#### 实例继承
为父类实例添加新特性，作为子类实例返回

~~~
function Parent(value) {
  this.value = value
}
function Child(name) {
  let parent = new Parent
  parent.name = name || 'sufan'
  return parent
}

const child = new Child('222')
console.log(child.name)
~~~

#### 拷贝继承

### bind call apply 实现

#### call 的实现
传入的第一个参数，那么上下文默认是window
改变this的指向，让新的对象可以这行， 并接受参数
~~~
Function.prototype.myCall = function (context) {
  if(typeof this !== 'function'){
    throw new TypeError('Error');
  }
  context = context || window
  context.fn = this
  const args = [...arguments].slice(1)
  const result = context.fn(...args)
  delete context.fn
  return result;
}

~~~

#### apply的实现
~~~
Function.prototype.myApply = function (context) {
  if(typeof this !== 'function') {
    throw new TypeError('Error')
  }
  context = context || window
  context.fn = this
  let result
  if (arguments[1]) {
    result = context.fn(...arguments[1])
  } else {
    result = context.fn()
  }
  delete context.fn
  return result
}
~~~

#### bind的实现

- bind 返回了一个函数，对于函数来说有两种方式调用，一种是直接调用，一种是通过 new 的方式，我们先来说直接调用的方式
- 对于直接调用来说，这里选择了 apply 的方式实现，但是对于参数需要注意以下情况：因为 bind 可以实现类似这样的代码 f.bind(obj, 1)(2)，所以我们需要将两边的参数拼接起来，于是就有了这样的实现 args.concat(...arguments)
- 最后来说通过 new 的方式，对于 new 的情况来说，不会被任何方式改变 this，所以对于这种情况我们需要忽略传入的 this

~~~
Function.prototype.myBind = function (context) {
  if(typeof this !== 'function') {
    throw new TypeError('Error')
  }
  const _this = this
  const args = [...arguments].slice(1);
  return function F() {
    if(this instanceof F) {
      return new _this(...args, ...arguments)
    }
    return _this.apply(context, args.concat(...arguments))
  }
}
~~~

### new的实现
- 新生成一个对象
- 链接到原型
- 绑定this
- 返回新的对象

~~~
function myNew() {
  let obj = {};
  let con = [].shift.call(arguments);
  obj.__proto__ = con.prototype;
  let result = con.apply(obj, arguments)
  return result instanceof Object ? result : obj;
}

function myNew(ctor, ...args) {
  if(typeof ctor !== 'function'){
    throw 'newOperator function the first param must be a function';
  }
  let obj = Object.create(ctor.prototype);
  let res = ctor.apply(obj, args);
  let isObject = typeof res === 'object' && typeof res !== null;
  let isFunction = typeof res === 'function';
  return isObject || isFunction ? res : obj
}
~~~

### 简单Promise的实现

- 首先我们创建了三个常量用于表示状态，对于经常使用的一些值都应该通过常量来管理，便于开发及后期维护
- 在函数体内部首先创建了常量 that，因为代码可能会异步执行，用于获取正确的 this 对象
- 一开始 Promise 的状态应该是 pending
- value 变量用于保存 resolve 或者 reject 中传入的值
- resolvedCallbacks 和 rejectedCallbacks 用于保存 then 中的回调，因为当执行完 Promise 时状态可能还是等待中，这时候应该把 then 中的回调保存起来用于状态改变时使用
- 首先两个函数都得判断当前状态是否为等待中，因为规范规定只有等待态才可以改变状态
- 将当前状态更改为对应状态，并且将传入的值赋值给 value
- 遍历回调数组并执行

~~~
const PENDING = 'pending';
const RESOLVED = 'resolved';
const REJECTED = 'rejected';

function MyPromise(fn) {
  const that = this;
  that.state = PENDING;
  that.value = null;
  that.resolvedCallback = [];
  that.rejectedCallback = [];
  function resolve(value) {
    if(that.state === PENDING) {
      that.state = RESOLVED
      that.value = value;
      that.resolvedCallback.map(cb => cb(that.value))
    }
  }
  function reject(value) {
    if(that.state === PENDING) {
      that.state = REJECTED
      that.value = value;
      that.rejectedCallback.map(cb => cb(that.value))
    }
  }
  try {
    fn(resolve, reject)
  } catch (e) {
    reject(e)
  }
}

MyPromise.prototype.then = function(onFulfilled, onRejected) {
  const that = this;
  onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : v => v;
  onRejected = typeof onRejected === 'function' ? onRejected : r => { throw r };
  if(that.state === PENDING) {
    that.resolvedCallback.push(onFulfilled);
    that.rejectedCallback.push(onRejected);
  }
  if(that.state === RESOLVED) {
    onFulfilled(that.value)
  }
  if(that.state === REJECTED) {
    onRejected(that.value)
  }
}

new MyPromise((resolve, reject) => {
  setTimeout(() => {
    resolve(1)
  }, 0)
}).then(value => {
  console.log(value)
})

~~~

### 数组扁平化

#### 利用flat()
~~~
let arr = [1,2,[3,4,5,[6,7,8,[9,10]]]]
console.log(arr.flat(3))
~~~

#### replace + split
~~~
let arr = [1,2,[3,4,5,[6,7,8,[9,10]]]]
let str = JSON.stringify(arr)
console.log(str.replace(/(\[|\])/g, '').split(','))
~~~

#### replace + JSON.parse
~~~
let arr = [1,2,[3,4,5,[6,7,8,[9,10]]]]
let str = JSON.stringify(arr)
str = str.replace(/(\[|\])/g, '')
str = '[' + str + ']'
console.log(JSON.parse(str))
~~~

#### 普通递归
~~~
let arr = [1,2,[3,4,5,[6,7,8,[9,10]]]]
let result = [];
let fn = function (handlerArr) {
  for(let i=0; i < handlerArr.length; i++){
    let item = handlerArr[i];
    if(Array.isArray(handlerArr[i])){
      fn(item)
    }else {
      result.push(item)
    }
  }
}
fn(arr)
console.log(result)
~~~

#### 利用reduce函数进行迭代
~~~
let arr = [1,2,[3,4,5,[6,7,8,[9,10]]]]
function flatten(handlerArr) {
  return handlerArr.reduce((one, two) => {
    return one.concat(Array.isArray(two) ? flatten(two) : two)
  }, [])
}

console.log(flatten(arr))
~~~

#### 使用扩展运算符
~~~
let arr = [1,2,[3,4,5,[6,7,8,[9,10]]]]
while (arr.some(Array.isArray)){
  arr = [].concat(...arr)
}
console.log(arr)
~~~

### 高阶函数

> 一个函数可以接收另一个函数作为参数或者返回值为一个函数，这种函数成为高阶函数

#### 数组中的高阶函数
- map
- filter
- reduce
- sort

#### map实现
~~~
Array.prototype.myMap = function(callbackFn, thisArg) {
  // 处理数组异常的情况
  if(this === null || this === undefined) {
    throw new TypeError("Cannot read property 'map' of null or undefined")
  }
  // 处理回调异常的情况
  if(Object.prototype.toString.call(callbackFn) !=  "[object Function]") {
    throw new TypeError(callbackFn + ' is not a function')
  }
  let O = Object(this);
  let T = thisArg;
  let len = O.length >>> 0;
  let A = new Array(len)
  for(let k = 0; k < len; k++) {
    // 还记得原型链那一节提到的 in 吗？in 表示在原型链查找
    // 如果用 hasOwnProperty 是有问题的，它只能找私有属性
    if(k in O){
      let kValue = O[k];
      let mappedValue = callbackFn.call(T, kValue, k, O)
      A[k] = mappedValue;
    }
  }
  return A;
}

let arr = [1,2,3,4,5]
console.log(arr.myMap((item) => item * 2))
~~~

#### reduce实现
~~~
Array.prototype.myReduce = function (callbackFn, initialValue) {
  // 处理数组异常的情况
  if(this === null || this === undefined) {
    throw new TypeError("Cannot read property 'map' of null or undefined")
  }
  // 处理回调异常的情况
  if(Object.prototype.toString.call(callbackFn) !=  "[object Function]") {
    throw new TypeError(callbackFn + ' is not a function')
  }
  let O = Object(this);
  let len = O.length >>> 0;
  let K = 0;
  let accumulator = initialValue;
  if(accumulator === undefined) {
    for(let k = 0; k < len; k++) {
      if(k in O) {
        accumulator = O[k]
        K++;
        break;
      }
    }
    // 循环结束还没退出，就表示数组全为空
    // throw new Error('Each element of the array is empty');
  }
  for(let k = 0; k < len; k++) {
    if (k in O) {
      // 注意，核心！
      accumulator = callbackFn.call(undefined, accumulator, O[k], O);
    }
  }
  return accumulator;
}

let arr = [1,2,3,4,5,6]
console.log(arr.myReduce((one, two) => {
  return one + two
}))
~~~

#### push和pop的实现
~~~
Array.prototype.push = function(...items) {
  let O = Object(this);
  let len = this.length >>> 0;
  let argCount = items.length >>> 0;
  // 2 ** 53 - 1 为JS能表示的最大正整数
  if (len + argCount > 2 ** 53 - 1) {
    throw new TypeError("The number of array is over the max value restricted!")
  }
  for(let i = 0; i < argCount; i++) {
    O[len + i] = items[i];
  }
  let newLength = len + argCount;
  O.length = newLength;
  return newLength;
}

Array.prototype.pop = function() {
  let O = Object(this);
  let len = this.length >>> 0;
  if (len === 0) {
    O.length = 0;
    return undefined;
  }
  len --;
  let value = O[len];
  delete O[len];
  O.length = len;
  return value;
}

~~~

#### filter实现
~~~
Array.prototype.filter = function(callbackfn, thisArg) {
  // 处理数组类型异常
  if (this === null || this === undefined) {
    throw new TypeError("Cannot read property 'filter' of null or undefined");
  }
  // 处理回调类型异常
  if (Object.prototype.toString.call(callbackfn) != "[object Function]") {
    throw new TypeError(callbackfn + ' is not a function')
  }
  let O = Object(this);
  let len = O.length >>> 0;
  let resLen = 0;
  let res = [];
  for(let i = 0; i < len; i++) {
    if (i in O) {
      let element = O[i];
      if (callbackfn.call(thisArg, O[i], i, O)) {
        res[resLen++] = element;
      }
    }
  }
  return res;
}
~~~

### 拷贝

#### 浅拷贝
##### 手动实现
~~~
const shallowClone = (target) => {
  if(typeof target === 'object' && target !== null ){
    const cloneTarget = Array.isArray(target) ? [] : {};
    for(let prop in target) {
      if(target.hasOwnProperty(prop)) {
        cloneTarget[prop] = target[prop]
      }
    }
    return cloneTarget
  } else {
    return target
  }
}
~~~

##### Object.assign
Object.assign拷贝的是对象的属性的引用, 而不是对象本身
~~~
let obj = {name: 'sufan', age: 20}
const obj2 = Object.assign({}, obj, {name: 'lisi'})
console.log(obj, obj2)
~~~

##### concat浅拷贝数组
~~~
let arr = [1, 2, 3];
let newArr = arr.concat();
newArr[1] = 100;
console.log(arr, newArr)
~~~

##### slice浅拷贝
~~~
let arr = [1, 2, 3];
let newArr = arr.slice();
newArr[1] = 100;
console.log(arr, newArr)
~~~

##### (...)展开运算符
~~~
let arr = [1, 2, 3];
let newArr = [...arr];
newArr[1] = 300
console.log(arr, newArr)
~~~

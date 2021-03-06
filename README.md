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

### 数组去重

#### new Set()
~~~
let arr = [1,2,1,2,3,4,5,2,2,3,4,6,7,8,4,9]
console.log(Array.from(new Set(arr)))
console.log([...new Set(arr)])
~~~

#### new Map()
~~~
let arr = [1,2,1,2,3,4,5,2,2,3,4,6,7,8,4,9]
let result = []
let map = new Map();
for(let i of arr) {
  if(!map.has(i)) {
    map.set(i, true)
    result.push(i)
  }
}
console.log(result)
~~~

#### 使用include
~~~
let arr = [1,2,1,2,3,4,5,2,2,3,4,6,7,8,4,9]
let result = []
for(let i of arr) {
  if(!result.includes(i)) {
    result.push(i)
  }
}
console.log(result)
~~~

#### 使用循环
~~~
let arr = [1,2,1,2,3,4,5,2,2,3,4,6,7,8,4,9]
for (let i = 0; i < arr.length; i++) {
  for (let j = i+1; j < arr.length; j++) {
    if(arr[i] === arr[j]) {
      arr.splice(j, 1)
    }
  }
}

console.log(arr)
~~~

#### 利用Object + filter
~~~
let arr = [1,2,1,2,3,4,5,2,2,3,4,6,7,8,4,9]
const obj = {};
const result = arr.filter(item =>
  obj.hasOwnProperty(typeof item + item) ? false : obj[typeof item + item] = true
)

console.log(result)
~~~

### 对象去重
~~~
const list = [
  { id: 1, a: 1 },
  { id: 2, a: 2 },
  { id: 3, a: 3 },
  { id: 1, a: 4 },
]

const result = list.reduce((one, two) => {
  const ids = one.map(item => item.id)
  return ids.includes(two.id) ? one : one.concat(two)
}, [])
console.log(result)
~~~


#### 深拷贝

##### JSON.parse(JSON.stringify())
缺点
- 无法解决循环引用的问题
~~~
let a = {val: 2};
a.target = a
JSON.parse(JSON.stringify(a)) // 会报错 拷贝a会出现系统栈溢出， 因为出现无限循环的情况
~~~
- 无法拷贝特殊对象例如： regexp Date Set Map 等
- 无法拷贝函数

##### 手动实现
简单的deepClone存在的问题和JSON.parse(JSON.stringify())一样
~~~
const deepClone = (target) => {
  if(typeof target === 'object' && target !== null) {
    const cloneTarget = Array.isArray(target) ? [] : {};
    for (let prop in target){
      if(target.hasOwnProperty(prop)) {
        cloneTarget[prop] = deepClone(target[prop]);
      }
    }
    return cloneTarget
  } else {
    return target
  }
}
~~~

解决循环引用的问题
~~~
const isObject = (target) => (typeof target === 'object' || typeof target === 'function') && target !== null;
const deepClone = (target, map = new Map()) => {
  if (map.get(target)) return target
  if(isObject(target)) {
    map.set(target, true)
    const cloneTarget = Array.isArray(target) ? [] : {};
    for (let prop in target){
      if(target.hasOwnProperty(prop)) {
        cloneTarget[prop] = deepClone(target[prop], map);
      }
    }
    return cloneTarget
  } else {
    return target
  }
}
const a = {val:2}
a.target = a
let newObject = deepClone(a)
console.log(newObject)
~~~
引用关系
> 在计算机设计中， 弱引用与强引用是相对的，是指不能确保其引用的对象不会被垃圾回收器回收的引用。 一个对象若只被弱引用所引用，则被认为是不可访问（或弱可访问）的，并因此可能在任何时刻被回收

缺点：
- map上的key和map构成了强引用关系， 这是比较严重的

改进
- 很简单，让 map 的 key 和 map 构成弱引用即可。ES6给我们提供了这样的数据结构，它的名字叫WeakMap，它是一种特殊的Map, 其中的键是弱引用的。其键必须是对象，而值可以是任意的。

拷贝特殊对象

- 可继续遍历
~~~
const getType = Object.prototype.toString.call(obj);

const canTraverse = {
  '[object Map]': true,
  '[object Set]': true,
  '[object Array]': true,
  '[object Object]': true,
  '[object Arguments]': true,
};

const deepClone = (target, map = new Map()) => {
  if(!isObject(target))
    return target;
  let type = getType(target);
  let cloneTarget;
  if(!canTraverse[type]) {
    // 处理不能遍历的对象
    return;
  }else {
    // 这波操作相当关键，可以保证对象的原型不丢失！
    let ctor = target.prototype;
    cloneTarget = new ctor();
  }

  if(map.get(target))
    return target;
  map.put(target, true);

  if(type === mapTag) {
    //处理Map
    target.forEach((item, key) => {
      cloneTarget.set(deepClone(key), deepClone(item));
    })
  }

  if(type === setTag) {
    //处理Set
    target.forEach(item => {
      target.add(deepClone(item));
    })
  }

  // 处理数组和对象
  for (let prop in target) {
    if (target.hasOwnProperty(prop)) {
        cloneTarget[prop] = deepClone(target[prop]);
    }
  }
  return cloneTarget;
}
~~~

- 不可遍历的对象

~~~
const boolTag = '[object Boolean]';
const numberTag = '[object Number]';
const stringTag = '[object String]';
const dateTag = '[object Date]';
const errorTag = '[object Error]';
const regexpTag = '[object RegExp]';
const funcTag = '[object Function]';

const handleRegExp = (target) => {
  const { source, flags } = target;
  return new target.constructor(source, flags);
}

const handleFunc = (target) => {
  // 待会的重点部分
}

const handleNotTraverse = (target, tag) => {
  const Ctor = targe.constructor;
  switch(tag) {
    case boolTag:
    case numberTag:
    case stringTag:
    case errorTag:
    case dateTag:
      return new Ctor(target);
    case regexpTag:
      return handleRegExp(target);
    case funcTag:
      return handleFunc(target);
    default:
      return new Ctor(target);
  }
}

~~~

拷贝函数

提到函数，在JS种有两种函数，一种是普通函数，另一种是箭头函数。每个普通函数都是 Function的实例，而箭头函数不是任何类的实例，每次调用都是不一样的引用。那我们只需要 处理普通函数的情况，箭头函数直接返回它本身就好了。

那么如何来区分两者呢？

利用原型。箭头函数是不存在原型的。

~~~
const handleFunc = (func) => {
  // 箭头函数直接返回自身
  if(!func.prototype) return func;
  const bodyReg = /(?<={)(.|\n)+(?=})/m;
  const paramReg = /(?<=\().+(?=\)\s+{)/;
  const funcString = func.toString();
  // 分别匹配 函数参数 和 函数体
  const param = paramReg.exec(funcString);
  const body = bodyReg.exec(funcString);
  if(!body) return null;
  if (param) {
    const paramArr = param[0].split(',');
    return new Function(...paramArr, body[0]);
  } else {
    return new Function(body[0]);
  }
}
~~~

完整展示

~~~
const getType = obj => Object.prototype.toString.call(obj);

const isObject = (target) => (typeof target === 'object' || typeof target === 'function') && target !== null;

const canTraverse = {
  '[object Map]': true,
  '[object Set]': true,
  '[object Array]': true,
  '[object Object]': true,
  '[object Arguments]': true,
};
const mapTag = '[object Map]';
const setTag = '[object Set]';
const boolTag = '[object Boolean]';
const numberTag = '[object Number]';
const stringTag = '[object String]';
const symbolTag = '[object Symbol]';
const dateTag = '[object Date]';
const errorTag = '[object Error]';
const regexpTag = '[object RegExp]';
const funcTag = '[object Function]';

const handleRegExp = (target) => {
  const { source, flags } = target;
  return new target.constructor(source, flags);
}

const handleFunc = (func) => {
  // 箭头函数直接返回自身
  if(!func.prototype) return func;
  const bodyReg = /(?<={)(.|\n)+(?=})/m;
  const paramReg = /(?<=\().+(?=\)\s+{)/;
  const funcString = func.toString();
  // 分别匹配 函数参数 和 函数体
  const param = paramReg.exec(funcString);
  const body = bodyReg.exec(funcString);
  if(!body) return null;
  if (param) {
    const paramArr = param[0].split(',');
    return new Function(...paramArr, body[0]);
  } else {
    return new Function(body[0]);
  }
}

const handleNotTraverse = (target, tag) => {
  const Ctor = target.constructor;
  switch(tag) {
    case boolTag:
      return new Object(Boolean.prototype.valueOf.call(target));
    case numberTag:
      return new Object(Number.prototype.valueOf.call(target));
    case stringTag:
      return new Object(String.prototype.valueOf.call(target));
    case symbolTag:
      return new Object(Symbol.prototype.valueOf.call(target));
    case errorTag:
    case dateTag:
      return new Ctor(target);
    case regexpTag:
      return handleRegExp(target);
    case funcTag:
      return handleFunc(target);
    default:
      return new Ctor(target);
  }
}

const deepClone = (target, map = new WeakMap()) => {
  if(!isObject(target))
    return target;
  let type = getType(target);
  let cloneTarget;
  if(!canTraverse[type]) {
    // 处理不能遍历的对象
    return handleNotTraverse(target, type);
  }else {
    // 这波操作相当关键，可以保证对象的原型不丢失！
    let ctor = target.constructor;
    cloneTarget = new ctor();
  }

  if(map.get(target))
    return target;
  map.set(target, true);

  if(type === mapTag) {
    //处理Map
    target.forEach((item, key) => {
      cloneTarget.set(deepClone(key, map), deepClone(item, map));
    })
  }

  if(type === setTag) {
    //处理Set
    target.forEach(item => {
      cloneTarget.add(deepClone(item, map));
    })
  }

  // 处理数组和对象
  for (let prop in target) {
    if (target.hasOwnProperty(prop)) {
        cloneTarget[prop] = deepClone(target[prop], map);
    }
  }
  return cloneTarget;
}
~~~

### setTimeout 模拟 setInterval
- 事件触发线程：归属与浏览器而不是js的引擎，用来控制事件循环。 当js引擎执行代码块如setTimeout时，会将对应任务添加到事件线程中。由于js是单线程的所以这些待处理中的事件都得排队等待js引擎处理
- 定时触发线程： 因为js是单线程的，如果处于阻塞线程状态就会影响记时的准确性。记时完毕后，添加事件队列，让js来执行
具体涉及到js的EventLoop

~~~
setTimeout(function () {
    // 任务
    setTimeout(arguments.callee, interval);
}, interval)
~~~
`arguments.callee` 获取当前函数的引用

解决的问题:
- 在前一个定时器执行完前， 不会向队列中插入新的定时器
- 保证定时器间隔


### 节流
所谓节流，就是指连续触发事件但是在n秒中只执行一次。 节流会稀释函数执行的频率。
考虑一个场景，滚动事件中会发起网络请求，但是我们并不希望用户在滚动过程中一直发起请求，隔一段时间发起一次请求，而不是一直发起情况，这种情况我们可以使用节流

#### 时间戳版
~~~
const throttle = (func, wait=50) => {
  // 上次执行的时间
  let lastTime = 0;
  return function (...args) {
    // 当前时间
    let now = +new Date();
    if(now - lastTime > wait) {
      lastTime = now
      func.apply(this,args)
    }
  }
}

setInterval(
  throttle(() => {
    console.log(1)
  }, 3000),
  1
)
~~~

#### 定时器版

~~~
const throttle = (func, wait=50) => {
  let timeout;
  return function (...args) {
    if(!timeout) {
      timeout = setTimeout(() => {
        timeout = null;
        func.apply(this, args)
      }, wait);
    }
  }
}
~~~

### 防抖
所谓防抖，就是指触发事件后在 n 秒内函数只能执行一次，如果在 n 秒内又触发了事件，则会重新计算函数执行时间
#### 非立即执行
非立即执行的意思在触发事件函数不会立即执行，而是n秒后执行，如果在n秒内又触发了事件，这会重新计算函数执行时间

~~~
const debounce = (func, wait=50) => {
  // 缓存一个定时器
  let timer = 0;
  return function(...args) {
    if(timer) clearTimeout(timer)
    timer = setTimeout(() => {
      func.apply(this, args)
    }, wait)
  }
}
~~~

#### 立即执行
立即执行的意思是触发事件后函数会立即执行，然后n秒内不触发时间才能继续执行函数的结果

~~~
const debouce = (func, wait=50) => {
  let timeout;
  return function(...args) {
    if(timeout) clearTimeout(timeout);
    let callNow = !timeout;
    timeout = setTimeout(() => {
      timeout = null;
    }, wait);
    if(callNow) func.apply(this, args)
  }
}
~~~

#### 组合

~~~
/**
 * @desc 函数防抖
 * @param func 函数
 * @param wait 延迟执行毫秒数
 * @param immediate true 表立即执行，false 表非立即执行
 */
const debounce = (func, wait, immediate) => {
  let timeout;
  return function (...args) {
    if(timeout) clearTimeout(timeout);
    if(immediate) {
      let callNow = !timeout;
      timeout = setTimeout(() => {
        timeout = null;
      }, wait);
      if(callNow) func.apply(this,args)
    }else {
      timeout = setTimeout(() => {
        func.apply(this, args)
      }, wait);
    }
  }
}

~~~

### 函数柯里化

> 是把接受多个参数的函数变成接受一个单个参数的函数， 并且返回接受余下的参数而且返回结果的新函数的技术

~~~
function add(x, y) {
  return x + y
}

function changeAdd(x) {
  return function(y) {
    return x + y
  }
}
add(1,2)
changeAdd(1)(2)
~~~

#### 经典面试题
~~~
add(1)(2)(3) = 6;
add(1, 2, 3)(4) = 10;
add(1)(2)(3)(4)(5) = 15;
~~~

~~~
function add() {
  // 第一次执行时，定义一个数组专门用来存储所有的参数
  let args = Array.prototype.slice.call(arguments)
  // 在内部声明一个函数，利用闭包的特性保存args并收集所有的参数
  var adder = function () {
    args.push(...arguments);
    return adder
  }
  // 利用toStringde 隐式转换的特性，当最后执行隐式转换， 并计算机最终值的返回
  adder.toString = function () {
    return args.reduce(function(a, b) {
      return a+b
    })
  }
  return adder
}
console.log(add(1)(2)(3))
~~~

~~~
const curry = (fn, ...args1) => (...args2) => (
 arg => arg.length === fn.length ? fn(...arg) : curry(fn, ...arg)
)([...args1, ...args2]);

// 调用
const foo = (a, b, c) => a * b * c;
curry(foo)(2, 3, 4); // -> 24
curry(foo, 2)(3, 4); // -> 24
curry(foo, 2, 3)(4); // -> 24
curry(foo, 2, 3, 4)(); // -> 24
~~~

### js中的事件流
> html中与javaScript交互是通过事件驱动完成的，例如鼠标点击事件onclick、页面的滚动事件、onscroll等等，可以向文档或文档中的元素添加事件侦听器来预定事件。想要知道这些事件是在什么时候进行调用的，需要了解一下 "事件流"
> 事件流描述的是从页面中接收事件的顺序，DOM2级的事件流包括下面的阶段

- 事件捕获阶段
- 处于目标阶段
- 事件冒泡阶段

 ie8以上 e.stopPropagation() 方式阻止事件的冒泡，ie8以下e.cancleBubble = true 阻止事件冒泡，jQ 中的 mouseenter 和 mouseleave 也是默认不冒泡

#### addEventListener
> 是Dom2级事件新增的指定事件处理程序的操作，这个方法可以接收三个参数：要处理的事件、作为事件处理程序的函数和一个布尔值。最后的布尔值参数如果是true， 表示在捕获阶段调用事件处理程序； 如果表示false，表示冒泡阶段调用事件处理程序

**IE只支持事件冒泡**

#### 如何先冒泡后捕获
> 在dom标准事件模型中，是先捕获后冒泡。但是如果要实现先冒泡后捕获的效果，对于同一个事件，监听捕获和冒泡，分别对应的处理函数，监听到捕获事件，先暂缓执行，直到冒泡事件被捕获后执行捕获

### 伪数组
> 伪数组是一个含有length属性的json对象 利用Array.prototype.slice转换成真实的数组

~~~
let obj = {0: '1', 1: '2', length: 2}
let arr = Array.prototype.slice.call(obj)
console.log(arr)
~~~

### 排序

#### 冒泡排序
从第一个元素开始，把当前元素和下一个索引元素进行比较，如果当前元素大那么就交换位置，重复操作指导比较到最后一个元素
该算法的操作数是一个等差数列 n + (n-1) + (n-2) + 1 去掉常数项后，时间啊复杂度为O(n*n)
~~~
const bubble = (arr) => {
  for(let i = 0; i < arr.length; i++) {
    for(let j = i+1; j<=arr.length; j++) {
      if(arr[i] > arr[j]) {
        let temp = arr[j];
        arr[j] = arr[i];
        arr[i] = temp
      }
    }
  }
  return arr
}

const bubble = (arr) => {
  for(let i = arr.length - 1; i > 0 ; i--) {
    for(let k = 0; k < i; k++) {
      if(arr[k] > arr[k + 1]) {
        let temp = arr[k + 1];
        arr[k+1] = arr[k];
        arr[k] = temp;
      }
    }
  }
  return arr
}
~~~

#### 插入排序
第一个元素默认是已排的元素，取下一个元素和当前元素进行比较，如果当前的元素大就交换位置，那么此时第一个元素就是当前最小的数，所以取出操作从第三个元素开始，向前对比，重复操作

该算法的操作数是一个等差数列 n + (n-1) + (n-2) + 1 去掉常数项后，时间啊复杂度为O(n*n)
~~~
const insertSort = (arr, start = 0, end) => {
  end = end || arr.length;
  for(let i=0; i<end; i++) {
    for(let j = i; j>start && arr[j-1] > arr[j]; j--) {
      let temp = arr[j];
      arr[j] = arr[j-1];
      arr[j-1] = temp;
    }
  }
  return arr;
}
~~~

#### 选择排序
遍历数组，设置最小值索引为0， 如果取出的值比当前最小值小，就替换最小值的索引， 遍历完成后，将第一个元素和最小值索引上的值交换，如上操作，第一个元素就是数组中最小的值，下次遍历就可以从从索引为1开始重复上述的操作了

该算法的操作数是一个等差数列 n + (n-1) + (n-2) + 1 去掉常数项后，时间啊复杂度为O(n*n)
~~~
const selection = (arr) => {
  if(!Array.isArray(arr)) return;
  for (let i = 0; i<arr.length-1; i++){
    let minIndex = i;
    for(let j = i+1; j<arr.length; j++) {
      minIndex = arr[j] < arr[minIndex] ? j : minIndex
    }
    let temp = arr[i];
    arr[i] = arr[minIndex];
    arr[minIndex] = temp;
  }
  return arr;
}
~~~

#### 归并排序
递归的将数组两两分开直到最多包含两个元素，然后将数组排序合并，最终合并为排序好的数组

~~~
const sort = (arr) => {
  if(!Array.isArray(arr)) return;
  mergeSort(arr, 0, arr.length - 1);
  return arr
}
const mergeSort = (arr, left, right) => {
  if(left === right) return   // 左右索引相同
  let mid = parseInt(left + ((right - left) >> 1));
  mergeSort(arr, left, mid)
  mergeSort(arr, mid + 1, right)

  let help = [];
  let i = 0;
  let p1 = left;
  let p2 = mid + 1;
  console.log(mid)
  console.log(p1, p2, 7777777)
  while (p1 <= mid && p2 <= right) {
    console.log(arr[p1++], 333)
    help[i++] = arr[p1] < arr[p2] ? arr[p1++] : arr[p2++]
  }
  while (p1 <= mid) {
    help[i++] = arr[p1++];
  }
  while (p2 <= right) {
    help[i++] = arr[p2++];
  }
  for (let i = 0; i < help.length; i++) {
    arr[left + i] = help[i];
  }
  return arr;
}

~~~

#### 快排
随机选取一个数组中的值作为基准值，从左至右与基准值对比大小，比基准值小的放左边，大的放右边，对比完成后将基准值和第一个比基准值大的交换位置。然后将数组以基准值的位置分为两部分，继续递归以上操作。

该算法的复杂度和归并排序是相同的，但是额外空间复杂度比归并排序少，只需 O(logN)，并且相比归并排序来说，所需的常数时间也更少。
~~~
let arr = [1,5,7,3,6,9,2,6,8]
var quickSort = function(arr) {
  　　if (arr.length <= 1) {//如果数组长度小于等于1无需判断直接返回即可
          return arr;
      }
  　　var pivotIndex = Math.floor(arr.length / 2);//取基准点
  　　var pivot = arr.splice(pivotIndex, 1)[0];//取基准点的值,splice(index,1)函数可以返回数组中被删除的那个数
  　　var left = [];//存放比基准点小的数组
  　　var right = [];//存放比基准点大的数组
  　　for (var i = 0; i < arr.length; i++){ //遍历数组，进行判断分配
  　　　　if (arr[i] < pivot) {
  　　　　　　left.push(arr[i]);//比基准点小的放在左边数组
  　　　　} else {
  　　　　　　right.push(arr[i]);//比基准点大的放在右边数组
  　　　　}
  　　}
           //递归执行以上操作,对左右两个数组进行操作，直到数组长度为<=1；
  　　return quickSort(left).concat([pivot], quickSort(right));
  };

console.log(quickSort(arr))
~~~
### (算法题) 如何从10000个数中找到最大的10个数
> 创建一个最小堆结构，初始值为10000个数的前10个，堆顶为10个数里的最小数。然后遍历剩下的9990个数，如果数字小于堆顶的数，则直接丢弃，否则把堆顶的数删除，将遍历的数插入堆中，堆结构进行自动调整，所以可以保证堆顶的数一定是10个数里最小的。遍历完毕后，堆里的10个数就是这10000个数里面最大的10个。

## React
### React实现的移动应用中，如果出现卡顿，有哪些可以考虑的优化方案
- 增加shouldComponentUpdate钩子对新旧props进行比较，如果值相同则阻止更新，避免不必要的渲染，或者使用PureReactComponent替代Component，其内部已经封装了shouldComponentUpdate的浅比较逻辑；
- 对于列表或其他结构相同的节点，为其中的每一项增加唯一key属性，以方便React的diff算法中对该节点的复用，减少节点的创建和删除操作；
- render函数中减少类似onClick={() => {doSomething()}}的写法，每次调用render函数时均会创建一个新的函数，即使内容没有发生任何变化，也会导致节点没必要的重渲染，建议将函数保存在组件的成员对象中，这样只会创建一次；
- 组件的props如果需要经过一系列运算后才能拿到最终结果，则可以考虑使用reselect库对结果进行缓存，如果props值未发生变化，则结果直接从缓存中拿，避免高昂的运算代价；
- webpack-bundle-analyzer分析当前页面的依赖包，是否存在不合理性，如果存在，找到优化点并进行优化。

### 高阶组件
高阶组件(Higher Order Componennt)本身其实不是组件，而是一个函数，这个函数接收一个元组件作为参数，然后返回一个新的增强组件，高阶组件的出现本身也是为了逻辑复用

### 什么是 React Fiber?
Fiber 是 React 16 中新的协调引擎或重新实现核心算法。它的主要目标是支持虚拟DOM的增量渲染。React Fiber 的目标是提高其在动画、布局、手势、暂停、中止或重用等方面的适用性，并为不同类型的更新分配优先级，以及新的并发原语。
React Fiber 的目标是增强其在动画、布局和手势等领域的适用性。它的主要特性是增量渲染:能够将渲染工作分割成块，并将其分散到多个帧中。

### 在 React 中使用构造函数和 getInitialState 有什么区别？
构造函数和getInitialState之间的区别就是ES6和ES5本身的区别。在使用ES6类时，应该在构造函数中初始化state，并在使用React.createClass时定义getInitialState方法。
~~~
class MyComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = { /* initial state */ };
  }
}
~~~
等价于
~~~
var MyComponent = React.createClass({
  getInitialState() {
    return { /* initial state */ };
  },
});
~~~

### 当调用setState时，React render 是如何工作的？
咱们可以将"render"分为两个步骤：
- 虚拟 DOM 渲染:当render方法被调用时，它返回一个新的组件的虚拟 DOM 结构。当调用setState()时，render会被再次调用，因为默认情况下shouldComponentUpdate总是返回true，所以默认情况下 React 是没有优化的。
- 原生 DOM 渲染:React 只会在虚拟DOM中修改真实DOM节点，而且修改的次数非常少——这是很棒的React特性，它优化了真实DOM的变化，使React变得更快。

### react中三种获取数据

[三种获取数据](https://juejin.im/post/5dc4ada5f265da4cfb51303e)

#### 使用生命周期获取数据
- componentDidMount()：组件挂载后执行
- componentDidUpdate(prevProps):当 props 或 state 改变时执行

优点：
这种方法很容易理解:componentDidMount()在第一次渲染时获取数据，而componentDidUpdate()在props更新时重新获取数据。

缺点：
- 样板代码：基于类的组件需要继承React.Component，在构造函数中执行 super(props) 等等。
- this：使用 this 关键字很麻烦。
- 代码重复： componentDidMount()和componentDidUpdate()中的代码大部分是重复的。
- 很难重用： 员工获取逻辑很难在另一个组件中重用

#### 使用Hooks获取数据
~~~
import EmployeesList from "./EmployeesList";
import { fetchEmployees } from "./fake-fetch";

function EmployeesPage({ query }) {
  const [isFetching, setFetching] = useState(false);
  const [employees, setEmployees] = useState([]);

  useEffect(function fetch() {
    (async function() {
      setFetching(true);
      setEmployees(await fetchEmployees(query));
      setFetching(false);
    })();
  }, [query]);

  if (isFetching) {
    return <div>Fetching employees....</div>;
  }
  return <EmployeesList employees={employees} />;
}
~~~

优点：
- 清楚和简单：Hooks没有样板代码，因为它们是普通的函数。
- 可重用性：在 Hooks 中实现的获取数据逻辑很容易重用。

缺点：
- 需要前置知识：Hooks 有点违反直觉，因此在使用之前必须理解它们，Hooks 依赖于闭包，所以一定要很好地了解它们。
- 必要性： 使用Hooks，仍然必须使用命令式方法来执行数据获取。

#### 使用suspense获取数据
~~~
import React, { Suspense } from "react";
import EmployeesList from "./EmployeesList";

function EmployeesPage({ resource }) {
  return (
    <Suspense fallback={<h1>Fetching employees....</h1>}>
      <EmployeesFetch resource={resource} />
    </Suspense>
  );
}

function EmployeesFetch({ resource }) {
  const employees = resource.employees.read();
  return <EmployeesList employees={employees} />;
}
~~~

优点：
- Suspense 以声明性和同步的方式处理异步操作。组件没有复杂数据获取逻辑，而是以声明方式使用资源来渲染内容。在组件内部没有生命周期，没有 Hooks，async/await，没有回调：仅展示界面

## 浏览器
### 浏览器缓存机制
浏览器的缓存机制可分为强缓存和协商缓存，服务端可以在响应头中增加Cache-Control/Expires来为当前资源设置缓存有效期(Cache-Control的max-age的优先级高于Expires)，浏览器再次发送请求时，会先判断缓存是否过期，如果未过期则命中强缓存，直接使用浏览器的本地缓存资源，如果已过期则使用协商缓存。
协商缓存大致有以下两种方案：
(1) 唯一标识：Etag(服务端响应携带) & If-None-Match(客户端请求携带)；
(2) 最后修改时间： Last-Modified(服务端响应携带) & If-Modified-Since (客户端请求携带) ，其优先级低于Etag。
服务端判断值是否一致，如果一致，则直接返回304通知浏览器使用本地缓存，如果不一致则返回新的资源。

### 请介绍一下 XSS 和 CSRF 的区别，如何防御
#### XSS
> XSS 全称“跨站脚本”（Cross-site scripting），是注入攻击的一种。其特点是不对服务器端造成任何伤害，而是通过一些正常的站内交互途径，例如发布评论，提交含有 JavaScript 的内容文本。这时服务器端如果没有过滤或转义掉这些脚本，作为内容发布到了页面上，其他用户访问这个页面的时候就会运行这些脚本。

#### 防御 XSS 攻击可以通过以下两方面操作：
- 对用户表单输入的数据进行过滤，对 javascript 代码进行转义，然后再存入数据库；
- 在信息的展示页面，也要进行转义，防止 javascript 在页面上执行。

#### CSRF
> CSRF 的全称是“跨站请求伪造”（Cross-site request forgery），而 XSS 的全称是“跨站脚本”。看起来有点相似，它们都是属于跨站攻击——不攻击服务器端而攻击正常访问网站的用户，但前面说了，它们的攻击类型是不同维度上的分类。CSRF 顾名思义，是伪造请求，冒充用户在站内的正常操作。我们知道，绝大多数网站是通过 cookie 等方式辨识用户身份（包括使用服务器端 Session 的网站，因为 Session ID 也是大多保存在 cookie 里面的），再予以授权的。所以要伪造用户的正常操作，最好的方法是通过 XSS 或链接欺骗等途径，让用户在本机（即拥有身份 cookie 的浏览器端）发起用户所不知道的请求。 严格意义上来说，CSRF 不能分类为注入攻击，因为 CSRF 的实现途径远远不止 XSS 注入这一条。通过 XSS 来实现 CSRF 易如反掌，但对于设计不佳的网站，一条正常的链接都能造成 CSRF。

#### CSRF 攻击的防御可以通过以下两方面操作：
所有需要用户登录之后才能执行的操作属于重要操作，这些操作传递参数应该使用 post 方式，更加安全；
为防止跨站请求伪造，我们在某次请求的时候都要带上一个 csrf_token 参数，用于标识请求来源是否合法，csrf_token 参数由系统生成，存储在 SESSION 中。

### webSocket的实现与应用
> WebSocket是HTML5中的协议，支持持久连续，http协议不支持持久性连接。Http1.0和HTTP1.1都不支持持久性的链接，HTTP1.1中的keep-alive，将多个http请求合并为1个

#### WebSocket是什么样的协议
- HTTP的生命周期通过Request来界定，也就是Request一个Response，那么在Http1.0协议中，这次Http请求就结束了。在Http1.1中进行了改进，是的有一个connection：Keep-alive，也就是说，在一个Http连接中，可以发送多个Request，接收多个Response。但是必须记住，在Http中一个Request只能对应有一个Response，而且这个Response是被动的，不能主动发起。
- WebSocket是基于Http协议的，或者说借用了Http协议来完成一部分握手，在握手阶段与Http是相同的。我们来看一个websocket握手协议的实现，基本是2个属性，upgrade，connection。


## Css
### Css3
#### transition 过渡动画：
- transition-property：属性名称
- transition-duration: 间隔时间
- transition-timing-function: 动画曲线
- transition-delay: 延迟
##### animation 关键帧动画：
- animation-name：动画名称
- animation-duration: 间隔时间
- animation-timing-function: 动画曲线
- animation-delay: 延迟
- animation-iteration-count：动画次数
- animation-direction: 方向
- animation-fill-mode: 禁止模式

### IFC

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

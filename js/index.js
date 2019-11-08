// 组合继承
/* function Parent(value) {
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
console.log(child) */

// 寄生组合继承

/* function Parent(value) {
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
child.getValue() */

/* class Parent {
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
child.getValue() */

// 原型累继承
/* function Parent(name) {
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
console.log(child.age) */

// 构造函数继承
/* function Parent(name) {
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
console.log(child.name) */

// 实例继承
/* function Parent(value) {
  this.value = value
}
function Child(name) {
  let parent = new Parent
  parent.name = name || 'sufan'
  return parent
}

const child = new Child('222')
console.log(child.name) */

// call的实现
// 传入的第一个参数，那么上下文默认是window
// 改变this的指向，让新的对象可以这行， 并接受参数
/* Function.prototype.myCall = function (context) {
  if(typeof this !== 'function'){
    throw new TypeError('Error');
  }
  context = context || window
  context.fn = this
  const args = [...arguments].slice(1)
  const result = context.fn(...args)
  delete context.fn
  return result;
} */

// apply的实现
/* Function.prototype.myApply = function (context) {
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
} */

// bind的实现
/* Function.prototype.myBind = function (context) {
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
} */

//  手写new
/* function myNew() {
  let obj = {};
  let con = [].shift.call(arguments);
  obj.__proto__ = con.prototype;
  let result = con.apply(obj, arguments)
  return result instanceof Object ? result : obj;
} */

/* function myNew(ctor, ...args) {
  if(typeof ctor !== 'function'){
    throw 'newOperator function the first param must be a function';
  }
  let obj = Object.create(ctor.prototype);
  let res = ctor.apply(obj, args);
  let isObject = typeof res === 'object' && typeof res !== null;
  let isFunction = typeof res === 'function';
  return isObject || isFunction ? res : obj
} */


// 手写简单的promise
/* const PENDING = 'pending';
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
 */

// 扁平化数组

/* let arr = [1,2,[3,4,5,[6,7,8,[9,10]]]]
while (arr.some(Array.isArray)){
  arr = [].concat(...arr)
}
console.log(arr) */

/* Array.prototype.myMap = function(callbackFn, thisArg) {
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
console.log(arr.myMap((item) => item * 2)) */

/* Array.prototype.myReduce = function (callbackFn, initialValue) {
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
})) */

// 浅拷贝
/* const shallowClone = (target) => {
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
} */
/* let obj = {name: 'sufan', age: 20}
const obj2 = Object.assign({}, obj, {name: 'lisi'})
console.log(obj, obj2) */
// let arr = [1, 2, 3];
// let newArr = arr.slice();
// newArr[1] = 100;
// console.log(arr, newArr)
/* let arr = [1, 2, 3];
let newArr = [...arr];
newArr[1] = 300
console.log(arr, newArr) */

//  深拷贝
/* const isObject = (target) => (typeof target === 'object' || typeof target === 'function') && target !== null;
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
 */
// 冒泡排序
/* const bubble = (arr) => {
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
} */

/* const bubble = (arr) => {
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
} */

//  插入排序
/* const insertSort = (arr, start = 0, end) => {
  end = end || arr.length;
  for(let i=0; i<end; i++) {
    for(let j = i; j>start && arr[j-1] > arr[j]; j--) {
      let temp = arr[j];
      arr[j] = arr[j-1];
      arr[j-1] = temp;
    }
  }
  return arr;
} */

// 选择排序
/* const selection = (arr) => {
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
} */

//  归并排序
/* const sort = (arr) => {
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
} */

/* let arr = [1,5,7,3,6,9,2,6,8]
console.log(_sort(arr)) */
/* let arr = [1,5,7,3,6,9,2,6,8]
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
 */

//  节流
/* const throttle = (func, wait=50) => {
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
 */

/* const throttle = (func, wait=50) => {
  let timeout;
  return function (...args) {
    if(!timeout) {
      timeout = setTimeout(() => {
        timeout = null;
        func.apply(this, args)
      }, wait);
    }
  }
} */

//  防抖
/* const debounce = (func, wait=50) => {
  // 缓存一个定时器
  let timer = 0;
  return function(...args) {
    if(timer) clearTimeout(timer)
    timer = setTimeout(() => {
      func.apply(this, args)
    }, wait)
  }
}
 */

// 立即执行
/* const debouce = (func, wait=50) => {
  let timeout;
  return function(...args) {
    if(timeout) clearTimeout(timeout);
    let callNow = !timeout;
    timeout = setTimeout(() => {
      timeout = null;
    }, wait);
    if(callNow) func.apply(this, args)
  }
} */

// 组合

/* const debounce = (func, wait, immediate) => {
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
 */

//  setTimeout 模拟 setInterval

// 函数的柯里化
/* function add() {
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


console.log(add(1)(2)(3)) */

/* let a = {
  i: 1,
  toString: () => {
    return a.i ++
  }
}

if(a == 1 && a==2) {
  console.log('成功')
}
 */
/* const list = [
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
 */
/* function a () {}
a.toString = function () {
	return '3'
}
console.log(a) */
let obj = {0: '1', 1: '2', length: 2}
let arr = Array.prototype.slice.call(obj)
console.log(arr)

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

// 手写简单的promise
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

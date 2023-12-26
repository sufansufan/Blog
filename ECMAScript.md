# ECMAScript2023  ES14

2023 年 6 月 27 日，第 125 届 ECMA 大会正式批准了 ECMAScript 2023 语言规范

全文概览

- 从尾到头搜索数组: `findLast()` 、 `findLastIndex()`
- `HashBang`语法
- 通过副本更改数组： `toReversed() ` 、`toSorted()` 、`toSpliced()` 、`with()`
- symbol作为weakMap的键

## 从尾到头搜索数组

它们的用法和find()、findIndex()类似，唯一不同的是它们是 从后向前 遍历数组，这两个方法适用于数组和类数组。

- findLast() 会返回第一个查找到的元素，如果没有找到，就会返回 undefined；
- findLastIndex() 会返回第一个查找到的元素的索引。如果没有找到，就会返回 -1；

```javascript
const array = [{ v: 1 }, { v: 2 }, { v: 3 }, { v: 4 }, { v: 5 }]
array.findLast(el => el.v > 3) // { v: 5 }
array.findLast(el => el.v > 5) // undefined
array.findLastIndex(el = el.v > 3) // 4
array.findLastIndex(elem => elem.v > 5)  // -1;
```

## Hashbang

Unix 的命令行脚本都支持#!命令，又称为 Hashbang。这个命令放在脚本的第一行，用来指定脚本的执行器。Hashbang 就是想为 JavaScript 脚本引入了#!命令，这个命令写在脚本文件或者模块文件的第一行：

```
// 写在脚本文件的第一行
#!/usr/bin/env node
'use strict';
console.log(1);

// 写在模块文件的第一行
#!/usr/bin/env node
export {};
console.log(1);
```

这样，Unix 命令行就可以直接执行脚本了：

```
# 以前执行脚本
node hello.js

# 有了 hashbang 之后执行脚本
./hello.js
```

## 通过副本更改数组

通过副本更改数组的方法有四个：

- Array.prototype.toReversed()
- Array.prototype.toSorted()
- Array.prototype.toSpliced()
- Array.prototype.with()

我们知道，大多数的数组方法都是非破坏性的，也就是不会改变原数组，比如 filter() 方法：

```javascript
const arr = ['a', 'b', 'b', 'a'];
const result = arr.filter(x => x !== 'b');
console.log(result); // ['a', 'a']
```

当然，也有一些是破坏性的方法，它们在执行时会改变原数组，比如 sort() 方法：

```javascript
const arr = ['c', 'a', 'b'];
const result = arr.sort();
console.log(result); // ['a', 'b', 'c']
```

在数组的方法中，下面的方法是具有破坏性的：

- reverse()
- sort()
- splice()

如果想要这些数组方法应用于数组而不改变它，可以使用下面任意一种形式：

```javascript
const sorted1 = arr.slice().sort();
const sorted2 = [...arr].sort();
const sorted3 = Array.from(arr).sort();
```

可以看到，我们首先需要创建数组的副本，再对这个副本进行修改。因此就引入了这三个方法的非破坏性版本，因此不需要手动创建副本再进行操作：

- reverse() 的非破坏性版本：toReversed()
- sort() 非破坏性版本：toSorted(compareFn)
- splice() 非破坏性版本：toSpliced(start, deleteCount, ...items)

这些函数属性引入到了 Array.prototype：

- Array.prototype.toReversed() -> Array
- Array.prototype.toSorted(compareFn) -> Array
- Array.prototype.toSpliced(start, deleteCount, ...items) -> Array
- Array.prototype.with(index, value) -> Array

除此之外，还有了一个新的非破坏性方法：with()。该方法会以非破坏性的方式替换给定 index 处的数组元素，即 arr[index]=value 的非破坏性版本。

所有这些方法都将保持目标数组不变，并返回它的副本并执行更改。这些方法适用于数组，也适用于类型化数组，即以下类的实例：

- Int8Array
- Uint8Array
- Uint8ClampedArray
- Int16Array
- Uint16Array
- Int32Array
- Uint32Array
- Float32Array
- Float64Array
- BigInt64Array
- BigUint64Array

### Array.prototype.toReversed()

toReversed() 是 reverse() 方法的非破坏性版本：

```javascript
const arr = ['a', 'b', 'c'];
const result = arr.toReversed();
console.log(result); // ['c', 'b', 'a']
console.log(arr);    // ['a', 'b', 'c']
```

### Array.prototype.toSorted()

```javascript
const arr = ['c', 'a', 'b'];
const result = arr.toSorted();
console.log(result);  // ['a', 'b', 'c']
console.log(arr);     // ['c', 'a', 'b']
```

### Array.prototype.toSpliced()

splice() 方法比其他几种方法都复杂，其使用形式：splice(start, deleteCount, ...items)。该方法会从从 start 索引处开始删除 deleteCount个元素，然后在 start 索引处开始插入item 中的元素，最后返回已经删除的元素。

toSpliced 是 splice() 方法的非破坏性版本，它会返回更新后的数组，原数组不会变化，并且无法再得到已经删除的元素：

```
const arr = ['a', 'b', 'c', 'd'];
const result = arr.toSpliced(1, 2, 'X');
console.log(result); // ['a', 'X', 'd']
console.log(arr);    // ['a', 'b', 'c', 'd']
```

### Array.prototype.with()

.with()方法的使用形式：.with(index, value)，它是 arr[index] = value 的非破坏性版本：

```javascript
const arr = ['a', 'b', 'c'];
const result = arr.with(1, 'X');
console.log(result);  // ['a', 'X', 'c']
console.log(arr);     // ['a', 'b', 'c']
```

## symbol作为weakMap的键

目前，WeakMaps 仅允许使用对象作为键，这是 WeakMaps 的一个限制。新功能扩展了 WeakMap API，允许使用唯一的 Symbol 作为键。

这样更易于创建和共享 key：

```javascript
const weak = new WeakMap();

// 更具象征意义的key
const key = Symbol('my ref');
const someObject = { /* data data data */ };

weak.set(key, someObject);
```

除此之外，该功能还解决了记录和元组提案中引入的问题：如何在原始数据类型中引用和访问非原始值？ 记录和元组不能包含对象、函数或方法，当这样做时会抛出 TypeError：

```javascript
const server = #{
    port: 8080,
    handler: function (req) { /* ... */ }, // TypeError!
};
```

这种限制存在是因为记录和元组提案的关键目标之一是默认具有深度不可变性保证和结构相等性。接受 Symbol 值作为 WeakMap 键将允许 JavaScript 库实现它们自己的类似 RefCollection 的东西，它可以重用同时不会随着时间的推移泄漏内存：

```javascript
class RefBookkeeper {
    #references = new WeakMap();
    ref(obj) {
        const sym = Symbol();
        this.#references.set(sym, obj);
        return sym;
    }
    deref(sym) { return this.#references.get(sym); }
}
globalThis.refs = new RefBookkeeper();

const server = #{
    port: 8080,
    handler: refs.ref(function handler(req) { /* ... */ }),
};
refs.deref(server.handler)({ /* ... */ });
```

# ECMAScript2022  ES13

ES13 为我们带来了 6 个新特性。

全文概览	

- 模块顶层作用域支持await表达式
- 新增私有类元素、静态块；in操作操作符支持私有类元素
- 正则新增d标志和其对应的hasIndices属性，提供了获取捕获组开始索引和结束索引的方法
- Error实例增加cause属性， 可携带更多错误信息。
- String、Arrays、TypedArray 新增at方法，支持关联访问。
- Object.hasOwn 代替Object.prototype.hasOwnProperty,判断对象是否含有属性。

## 模块顶层作用域支持await表达式

以往我们总是在异步函数体内使用 await 表达式，自 ES13 后，我们也可以在一个模块的顶层使用它了。

在模块顶层使用 await 表达式

```javascript
// 异步加载资源
import { fetchPerson } from '@/services/person';
const person = await fetchPerson();

// 异步加载组件
await import('your-component-path');
```

在异步函数中使用 await 表达式

```javascript
import { get } from '@/utils/request';

export async function getPerson() {
    const person = await get('/person');
    return person;
}
```

**错误用法**

在以下几种语句内的 Formal Parameters 中使用 Await 表达式，会引发静态句法的语义错误。

1. 异步函数声明 (AsyncFunctionDeclaration)
2. 异步函数表达式 (AsyncFunctionExpression)
3. 异步生成器函数表达式 (AsyncGeneratorExpression)
4. Await 表达式内部 (AwaitExpression)

**特殊情况**

在早期，await 没有出现在关键字中，为了兼容旧代码，在一些特殊的 await 作为参数出现的情况下，它会被解释为标识符。如下所述：

1. 当 await 出现在 AsyncFunctionBody 和 AsyncFunctionDeclaration、AsyncFunctionExpression、AsyncGeneratorDeclaration、AsyncGeneratorExpression 的 FormalParameter 外部时，await 会被解析为标识符。
2. 当 await 出现在 FunctionExpression, GeneratorExpression, AsyncGeneratorExpression 的 BindingIdentifier 中时，await 会被解析为标识符。

## class新特性

### 私有类元素

在类的定义中，以”#“开头的标识为私有标识符，由私有标识符定义的类元素被称为私有类元素，私有类元素只能在类中才能被访问到，类的属性、方法、 静态方法、访问器、静态访问器都可以被定义为私有类元素。

```javascript
class ClassA {
    // 私有属性
    #privateProperty;

    // 静态私有属性
    static #privateStaticProperty;

    // 静态私有 Getter
    static get #privateStaticGet() {
        return 'private-static-get';
    }

    // 静态私有 Setter
    static set #privateStaticSet(val) {
    }

    // 静态私有方法
    static #privateStaticMethod() {
        return 'private-static-method'
    }

    constructor(propertyValue) {
        // 初始化私有属性
        this.#privateProperty = propertyValue;
    }

    // 私有 Get
    get #privateGet() {
        return 'private-get'
    }

    // 私有 Set
    set #privateSet() {
    }

    // 私有方法
    #privateMethod() {
        return 'private-method'
    }
}
```

在类的内部可以正常访问私有类元素，在类的外部访问私有类元素会抛出句法错误。

```javascript
class ClassA {
    // 私有属性
    #privateProperty;

    constructor(property, privateProperty) {
        this.property = property;
        this.#privateProperty = privateProperty;
    }

    // 在方法中访问私有属性
    getPrivateProperty() {
        return this.#privateProperty;
    }
}

const instance = new ClassA('property', 'private-property');

instance.property; // 'property'
instance.#privateProperty; // Uncaught SyntaxError: Private field '#privateProperty' must be declared in an enclosing class
instance.getPrivateProperty(); // 'private-property'
```

### 静态块

静态块为我们提供了更加灵活的静态类元素初始化渠道，我们可以在静态块中使用一系列的语句来完成静态类元素的初始化。我们可以利用this在静态块中访问类的其他静态属性（包括私有属性）。

```javascript
class ClassA {
    // 静态属性
    static staticProperty;

    // 静态块初始化静态属性，捕捉错误
    static {
        try {
            this.staticProperty = getStaticProperty();
        } catch {
            console.log('Error');
        }
    }
}
```

当一个类具有多个静态块时，它们会按照定义的顺序进行执行。

```javascript
class ClassA {
    // 静态属性 A
    static staticPropertyA;

    // 静态块 A
    static {
        this.staticPropertyA = 'static-block-a';
        console.log('static-block-a');
    }

    // 静态属性 B
    static staticPropertyB;

    // 静态块 B
    static {
        this.staticPropertyB - 'static-block-b';
        console.log('static-block-b');
    }
}

// 输出
// static-block-a
// static-block-b
```

当一个类具有父类时，会先执行父类的静态块，再执行子类的静态块。我们可以利用 super 在子类的静态块中访问父类的属性。

```javascript
// 父类
class ParentClass {
    // 父类属性
    static parentProperty;

    // 父类静态块
    static {
        this.parentProperty = 'parent-property';
        console.log('parent-static-block');
    }
}

// 子类
class ChildClass extends ParentClass {
    // 子类静态块
    static {
        console.log(super.parentProperty);
        console.log('child-static-block');
    }
}

// 输出
// parent-static-block
// parent-property
// child-static-block
```

### 私有in操作符

我们知道 in 操作符可以帮我们判断实例中是否存在属性，当新增了私有化类元素后，我们也可以和下面例子一样，在类定义内使用 in 操作符判断私有化类元素存在与否。

```javascript
class ClassA {
    // 私有属性
    #privateProperty;

    // 利用 in 操作符判断私有属性是否存在
    static hasPrivateProperty(instance) {
        return #privateProperty in instance
    }

    constructor(privateProperty) {
        this.#privateProperty = privateProperty;
    }
}

const instance = new ClassA('private-property');
ClassA.hasPrivateProperty(instance);

// 输出
// true
```

**小知识私有类元素标准推导**

*下面我们来看看标准中是如何表达私有化属性的把~*
*标准中定义了私有标识符，它由 "#" 开头，后接普通标识符。*

```text
PrivateIdentifier::
    # IdentifierName
```

*在类元素名中，包含了私有标识符，所以具有类元素名的类元素都可以被定义为私有类元素。*

```text
ClassElementName:    
    PropertyName PrivateIdentifier
```

*在类元素中又包含了方法、静态方法、属性、静态属性、类静态块，除了静态块没有类元素名外，其他都可被定义为私有类元素。*

```text
ClassElement:
    MethodDefination
    static MethodDefination
    FieldDefination
    static FieldDefination
    ClassStaticBlock
```

*方法的定义包含了类方法定义表达式、生成器方法、异步方法、异步生成器方法、 get 访问器、set 访问器。这些也都可以被定义为私有类元素*。

```text
MethodDefination:
    ClassElementName (UniqueFormalParameters) { FunctionBody }
    GeneratorMethod
    AsyncMethod
    AsyncGeneratorMethod
    get ClassElementName
    set ClassElementName
```

*根据以上标准定义的推导，类属性、方法、访问器，静态类属性、方法、访问器都可以通过私有标识符定义为私有类元素。*

## 正则 /d 标志

我们常用正则表达式来处理字符串，正则表达式有很多标志，它决定了正则状态机的行为和输出结果。ES13 新增的 d 标志对应正则实例的 hasIndices 属性，当设置 d 标志时，hasIndices 为 true 。使用 d 标志后，正则表达式的匹配结果将包含每个捕获组捕获子字符串的开始和结束游标。

~~~javascript
// 字符串
const str = "today is saturday";

// 正则表达式
const reg = /saturday/d;

// 匹配结果输出游标
const [start, end] = reg.exec(str).indices[0];

console.log([start, end]); // [9, 17]
~~~

## Error 对象的 cause 属性

在以往 Error 对象只能传递消息信息，现在 ES13 为 Error 增添了 cause 属性，它可以是任意数据类型，方便我们获取更多地错误信息。

```js
try {
    // 抛出带 cause 属性的 Error实例
    throw new Error('faied message', { cause: 'cause' });
} catch (error) {
    // 捕获 error 并输出 cause
    console.log(error.cause)
}

// 输出
// cause
```

## Strings、Arrays、TypedArrays 的 at 方法

我们利用下标访问数组元素时，下标会被转换为字符串，负数下标也对应着一个独立的数组元素，所以 Js 的数组是不支持关联访问的。ES13 新增了 at 方法，使得我们可以利用负数索引进行关联访问，例如以下示例，我们可以利用 at 方法和负数索引 -2 来访问倒数第二个元素。

```js
const array = [5, 12, 8, 130, 44];

array.at(-2); // 130
```

## Object.hasOwn

ES13 新增了 Object.hasOwn 方法判断这个实例上是否有属性，以代替之前的 Object.prototype.hasOwnProperty 方法。

```js
const object = {
    count: 1
};

Object.hasOwn(object, 'count'); // true
Object.hasOwn(object, 'toString'); // false
Object.hasOwn(object, 'property'); // false
```

# ECMAScript2021  ES12

全文概览

- String.prototype.replaceAll：有了这个API，替换字符不用写正则
- Promise.any(): 返回第一个fullfilled的promise, 若全部reject，则返回一个带有失败原因的AggregateError。
- WeakRefs：使用弱引用对象，该弱引用不会阻止GC，并且可以在GC前使用WeakRef.prototype.deref()解除该引用。
- 下划线（_）分隔符： 使用 _ 分割数字字面量以方便阅读
- intl.ListFormat: 用来处理和多语言相关的对象格式化操作
- intl.DateTimeFormat API中的dateStyle 和timeStyle 的配置项：用来处理多语言下的时间日期格式化函数

## replaceAll

模式的所有匹配都会被替代项替换。模式可以是 字符串或正则表达式，而替换项可以是字符串或针对每次匹配执行的函数。并返回一个全新的字符串

在没有这个特性之前，我们会这样写

```js
const str = "student is a real student";
const newStr = str.replace(/student/g, "hahaha");
console.log(newStr); 
```

有了replaceAll之后我们可以这么写了

```js
const str = "student is a real student";
const newStr = str.replaceAll('student', "hahaha");
console.log(newStr); 
```

最终运行的结果都是：hahaha is a real hahaha

## Promise.any

可以把 Promise.any 理解成 Promise.all 的相反操作。Promise.any 也可以接受一个 Promise 数组，当其中任何一个 Promise 完成（fullfill）时，就返回那个已经有完成值的 Promise。如果所有的 Promise 都拒绝（reject），则返回一个拒绝的 Promise，该 Promise 的返回值是一个 AggregateError 对象。

例如下面有三个Promise请求正常情况下：

```js
const p1 = new Promise((resolve, reject) => {
  setTimeout(() => resolve("A"), Math.floor(Math.random() * 1000));
});
const p2 = new Promise((resolve, reject) => {
  setTimeout(() => resolve("B"), Math.floor(Math.random() * 1000));
});
const p3 = new Promise((resolve, reject) => {
  setTimeout(() => resolve("C"), Math.floor(Math.random() * 1000));
});

(async function () {
  const result = await Promise.any([p1, p2, p3]);
  console.log(result); // 输出结果可能是 "A", "B" 或者 "C"
})();
```

如果存在某个Promise发生错误的情况：

```js
const p = new Promise((resolve, reject) => reject());

try {
  (async function () {
    const result = await Promise.any([p]);
    console.log(result);
  })();
} catch (error) {
  console.log(error.errors);
}
```

## 逻辑赋值操作符 ??=、&&=、 ||=

看下如下代码：

```js
let a = 1;
a = a + 2;
```

可以简写为：

```js
let a = 1;
a += 2;
```

有了这个新的标准中，逻辑表达式的操作符（`&&`、`||`、`??`）也可以简写了！

先来介绍下 ?? ，它是去年发布的标准中的新的逻辑操作符。大家可能遇到过，如果一个变量是空，需要给它赋值为一个默认值的情况。通常我们会这样写：

```js
let num = number || 222
```

但是，以上的代码会有一个 bug。如果`realCount`的值是`0`，则会被当作取不到其值，会取到`'无法获取'`这个字符串。而如果我们使用了`??`，只有当操作符左边的值是`null`或者`undefined`的时候，才会取操作符右边的值：

```js
let num = number ?? 222
```

接下来，再来看下新标准中的逻辑运算符怎么用

```js
// 等同于 a = a || b
a ||= b;
// 等同于 c = c && d
c &&= d;
// 等同于 e = e ?? f
e ??= f;
```

## WeakRef

`WeakRef`是一个 Class，一个`WeakRef`对象可以让你拿到一个对象的弱引用。这样，就可以不用阻止垃圾回收这个对象了。 可以使用其构造函数来创建一个`WeakRef`对象。

```js
// anObject 不会因为 ref 引用了这个对象，而不会被垃圾回收
let ref = new WeakRef(anObject);
```

我们可以用`WeakRef.prototype.deref()`来取到anObject的值。但是，在被引用对象被垃圾回收之后，这个函数就会返回`undefined`。

```js
// 如果 someObj 被垃圾回收了，则 obj 就会是 undefined
let obj = ref.deref();
```

## 下划线 (_) 分隔符

当你要写一个很长的数字的时候：

```js
let x = 233333333
```

数字太长会导致可读性很差。使用了数字分隔符 `_` （下划线），就可以让数字读的更清晰：

```js
let x = 2_3333_3333
// x 的值等同于 233333333，只是这样可读性更强，不用一位一位数了
```

## Intl.ListFormat

Intl.ListFormat 是一个构造函数，用来处理和多语言相关的对象格式化操作。来通过一个例子了解一下。

```js
const list = ['Apple', 'Orange', 'Banana']
new Intl.ListFormat('en-GB', { style: 'long', type: 'conjunction' }).format(list);
// "Apple, Orange and Banana"
new Intl.ListFormat('zh-cn', { style: 'short', type: 'conjunction' }).format(list);
// 会根据语言来返回相应的格式化操作
// "Apple、Orange和Banana"
```

## Intl.DateTimeFormat API 中的 dateStyle 和 timeStyle 的配置项

Intl.ListFormat 是一个用来处理多语言下的时间日期格式化的函数。ES2021 中给这个函数添加了两个新的参数：dateStyle 和 timeStyle，dateStyle 和 timeStyle 选项可用于请求给定长度的，特定于语言环境的日期和时间。 下面我们来通过例子来看一下这两个参数的用法：

```js
let a = new Intl.DateTimeFormat("en" , {
  timeStyle: "short"
});
console.log('a = ', a.format(Date.now())); // "13:31"
let b = new Intl.DateTimeFormat("en" , {
  dateStyle: "short"
});
console.log('b = ', b.format(Date.now())); // "21.03.2012"
// 可以通过同时传入 timeStyle 和 dateStyle 这两个参数来获取更完整的格式化时间的字符串
let c = new Intl.DateTimeFormat("en" , {
  timeStyle: "medium",
  dateStyle: "short"
});
console.log('c = ', c.format(Date.now())); // "21.03.2012, 13:31"
```

timeStyle 和 dateStyle 配置项有三个（下面以timeStyle为例）：

- short：11:27 PM
- medium：11:27:57 PM
- long：11:27:57 PM GMT+11

# ECMAScript2020  ES11

全文概况

- 动态import()：按需导入
- 空值合并运算符：表达式在？？的左侧运算符求值为undefined或者null， 返回其右侧
- 可选连接：?.用户检测不确定的中间节点
- BingInt: 新基本数据类型，表示任意精度的整数
- globalThis:浏览器：window、worker：self、node：global
- Promise.allSettled: 返回一个在所有给定的promise已被决议或被拒绝后决议的promise，并带有一个对象数组，每个对象表示对应的promise结果
- `for-in`结构：用于规范`for-in`语句的遍历顺序

## 动态 import ()

用了实现按需导入，`import()`是一个类似函数的语法关键字，类似super()，它接收一个字符串作为模块标识符，并返回一个 promise

在 ES 2015 定义的模块语法中，所有模块导入语法都是静态声明的：

```js
import aExport from "./module"
import * as exportName from "./module"
import { export1, export2 as alias2 } from "./module"
import "./module"
```

虽然这套语法已经可以满足绝大多数的导入需求，而且还可以支持实现静态分析以及树抖动等一系列重要的功能。但却无法满足一些需要动态导入的需求。例如：

- 需要根据浏览器兼容性有选择地加载一些支持库，
- 在实际需要时才加载某个模块的代码，再
- 只是单纯地希望延迟加载某些模块来以渐进渲染的方式改进加载体验

等等这些，在实际工作中也算是比较常见的需求。若没有动态导入，将难以实现这些需求。虽然我们可以通过创建 script 标签来动态地导入某些脚本，但这是特定于浏览器环境的实现方式，也无法直接和现有的模块语法结合在一起使用，所以只能作为内部实现机制，但不能直接暴露给模块的使用者。

但是动态 import () 解决了这个问题。他可以在任何支持该语法的平台中使用，比如 webpack、node 或 浏览器环境。并且模块标识符的格式则是由各平台自行指定，比如 webpack 及 node 支持使用模块名直接加载 node_modules 中的模块，而浏览器支持使用 url 加载远程模块。

```js
import('lodash').then(_ => {
    // other
})
```

当模块及其所依赖的其它模块都被加载并执行完毕后，promise 将进入*fulfilled*状态，结果值便是包含该模块所有导出内容的一个对象：具名导出项被放在该对象的同名属性中，而默认导出项则放在名为`default`的属性中，比如有如下模块 utils，其导入方式如下：

```js
// utils
export default 'hello lxm';
export const x = 11;
export const y = 22;

// 导入
import('a').then(module => {
    console.info(module)
})

// 结果：
{
   default: 'hello lxm'',
   x: 11,
   y: 22,
}
```

如果因为模块不存在或无法访问等问题导致模块加载或执行失败，promise 便会进入*rejected*状态，你可以在其中执行一些回退处理。

## 空值合并运算符（?? ）

大家可能遇到过，如果一个变量是空，需要给它赋值为一个默认值的情况。通常我们会这样写：

```js
let num = number || 222
```

但是，以上的代码会有一个 bug。如果`realCount`的值是`0`，则会被当作取不到其值，会取到`'无法获取'`这个字符串。如果想要做到这一点，在这之前就只能使用三元运算符来实现：

```js
let num = (number !== undefined) ? number : 222
```

但现在可以使用了`??`运算符了，它只有当操作符左边的值是`null`或者`undefined`的时候，才会取操作符右边的值：

```js
let num = number ?? 222
```

## 可选链接

当我们需要尝试访问某个对象中的属性或方法而又不确定该对象是否存在时，该语法可以极大的简化我们的代码，比如下面这种情况：

```js
const el = document.querySelector(".class-a")
const height = el.clientHeight
```

当我们并不知道页面中是否真的有一个类名为 class-a 的元素，因此在访问`clientHeight`之前为了防止bug产生需要先进行一些判断：

```js
const height = el ? el.clientHeight : undefined
```

上面的写法虽然可以实现，但是的确有人会觉得麻烦，而使用「可选链操作符」 ，就可以将代码简化成如下形式：

```js
const height = el?.clientHeight
```

下面介绍常用的使用场景：

### **属性访问**

需要获取某个对象中的属性，就都可以使用该语法：

```js
a?.b
a?.[x]
```

上面的代码中，如果 a 为`undefined`或`null`，则表达式会立即返回`undefined`，否则返回所访问属性的值。也就是说，它们与下面这段代码是等价的：

```js
a == null ? undefined : a.b
a == null ? undefined : a[x]
```

### **方法调用**

在尝试调用某个方法时，也可以使用该语法：

```text
a?.()
```

同样是如果 a 为`undefined`或`null`，则返回`undefined`，否则将调用该方法。不过需要额外注意的是，该操作符并不会判断 a 是否是函数类型，因此如果 a 是一个其它类型的值，那么这段代码依然会在运行时抛出异常。

### 访问深层次属性

在访问某个对象较深层级的属性时，也可以串联使用该操作符：

```js
a?.b?.[0]?.()?.d
```

可能有人会懒得先去判断是否真的有必要，就给访问链路中的每个属性都加上该操作符。但类似上面代码中所展示的那样，这种代码可读性比较差。而且若真的有一个应当存在的对象因为某些 bug 导致它没有存在，那么在访问它时就应当是抛出异常，这样可以及时发现问题，而不是使它被隐藏起来。**建议只在必要的时候才使用可选链操作符**。

## BigInt

在 ES 中，所有 Number 类型的值都使用 64 位浮点数格式存储，因此 Number 类型可以有效表示的最大整数为 2^53。而使用新的 BigInt 类型，可以操作任意精度的整数。

有两种使用方式：1、在数字字面量的后面添加后缀`n`；2、使用其构造函数`BigInt`

```js
const bigInt = 9007199254740993n
const bigInt = BigInt(9007199254740992)

// 在超过 Number 最大整数限制时，我们也可以改为传入一个可能被正确解析的字符串
const bigInt = BigInt('9007199254740993')
```

和 Number 类似，BigInt 也支持`+`、`-`、`*`、`**`、`%`运算符：

```js
3n + 2n    // => 5n
3n * 2n    // => 6n
3n ** 2n   // => 9n
3n % 2n    // => 1n
```

但因为 BigInt 是纯粹的整数类型，无法表示小数位，因此 BigInt 的除法运算（`/`）的结果值依然还是一个整数，即向下取整：

```js
const bigInt = 3n;
```

同样也位支持位运算符，除了无符号右移运算符：

```js
1n & 3n    // => 1n
1n | 3n    // => 3n
1n ^ 3n    // => 2n
~1n        // => -2n
1n << 3n   // => 8n
1n >> 3n   // => 0n

1n >>> 3n  // Uncaught TypeError: BigInts have no unsigned right shift, use >> instead
```

BigInt 可以和字符串之间使用`+`运算符连接

```js
1n + ' Number'   // => 1 Number
'Number ' + 2n   // => Number 2
```

下面这些场景不支持使用BigInt：

1、BigInt 无法和 Number 一起运算，会抛出类型异常

```js
1n + 1
// Uncaught TypeError: Cannot mix BigInt and other types, use explicit conversions
```

2、一些内置模块如 Math 也不支持 BigInt，同样会抛出异常

```js
Math.pow(2n, 64n)
// Uncaught TypeError: Cannot convert a BigInt value to a number
```

3、BigInt 和 Number 相等，但并不严格相等，但他们之间可以比较大小

```js
1n == 1    // => true
1n === 1   // => false
```

但他们之间是可以比较大小的：

```js
1n < 2     // => true
1n < 1     // => false

2n > 1     // => true
2n > 2     // => false
```

而且在转换为 Boolean 值时，也和 Number 一样，`0n` 转为 `false`，其它值转为 `true`：

```js
!!0n       // => false
!!1n       // => true
```

另外两者之间只能使用对方的构造函数进行转换：

```js
Number(1n) // => 1
BigInt(1)  // => 1n
```

但两者之间的转换也都有一些边界问题：

```js
// 当 BigInt 值的精度超出 Number 类型可表示的范围时，会出现精度丢失的问题
Number(9007199254740993n)
// => 9007199254740992

// 当 Number 值中有小数位时，BigInt 会抛出异常
BigInt(1.1)
// VM4854:1 Uncaught RangeError: The number 1.1 cannot be converted to a BigInt because it is not an integer
```

配套地，在类型化数组中也提供了与 BigInt 对应的两个数组类型：`BigInt64Array`和`BigUint64Array`：

```js
const array = new BigInt64Array(4);

array[0]   // => 0n

array[0] = 2n
array[0]   // => 2n
```

但因为每个元素限定只有 64 位，因此即便使用无符号类型，最大也只能表示 2^64 - 1：

```js
const array = new BigUint64Array(4);

array[0] = 2n ** 64n
array[0]   // => 0n

array[0] = 2n ** 64n - 1n
array[0]   // => 18446744073709551615n
```

## globalThis

浏览器：window、worker：self、node：global

在浏览器环境中，我们可以有多种方式访问到全局对象，最常用到的肯定是 `window`，但除此之外还有 `self`，以及在特殊场景下使用的 `frames`、`paraent` 以及 `top`。

我们通常不怎么需要关心 `window` 和 `self` 之间的区别，但如果使用 Web Worker，那就应当了解 `window` 是只在主线程中才有的全局属性，在 Worker 线程中，我们需要改为使用 `self`。

而在 node.js 环境中，我们需要使用 `global`，至于像 [JSC.js](https://link.zhihu.com/?target=https%3A//mbbill.github.io/JSC.js/) 这种更小众的环境中，则需要使用 `this`。

在一般的开发工作中，可能很少需要访问全局环境，而且大多时候也只需要基于一种环境进行开发，所以不太需要处理这种麻烦的问题。但是对于 [es6-shim](https://link.zhihu.com/?target=https%3A//github.com/paulmillr/es6-shim) 这种需要支持多种环境的基础库来说，它们需要解决这个问题。

早先，我们可以通过下面这段代码较为方便地拿到全局对象：

```js
const globals = (new Function('return this;'))()
```

但受到 [Chrome APP 内容安全策略](https://link.zhihu.com/?target=https%3A//developer.chrome.com/extensions/contentSecurityPolicy%23JSEval)的影响（为缓解跨站脚本攻击的问题，该政策要求禁止使用 eval 及相关的功能），上面这段代码将无法在 Chrome APP 的运行环境中正常执行。

无奈之下，像 `es6-shim` 这种库就只能[穷举所有可能的全局属性](https://link.zhihu.com/?target=https%3A//github.com/paulmillr/es6-shim/blob/0d47be15894bb0f95068545aed69d388be8ce7d0/es6-shim.js%23L175-L186)：

```js
var getGlobal = function () {
    // the only reliable means to get the global object is
    // `Function('return this')()`
    // However, this causes CSP violations in Chrome apps.
    if (typeof self !== 'undefined') { return self; }
    if (typeof window !== 'undefined') { return window; }
    if (typeof global !== 'undefined') { return global; }
    throw new Error('unable to locate global object');
};

var globals = getGlobal();

if (!globals.Reflect) {
    defineProperty(globals, 'Reflect', {}, true);
}
```

这种问题等真的遇到了，每次处理起来也是很麻烦的。所以才有了这次提案中的 `globalThis`。

通过 `globalThis`，我们终于可以使用一种标准的方法拿到全局对象，而不用关心代码的运行环境。对于 `es6-shim` 这种库来说，这是一个极大的便利特性：

```js
if (!globalThis.Reflect) {
    defineProperty(globalThis, 'Reflect', {}, true);
}
```

另外，关于 `globalThis` 还有一些细节的问题，比如为满足 [Secure ECMAScript](https://link.zhihu.com/?target=https%3A//github.com/tc39/proposal-ses) 的要求，`globalThis` 是可写的。而在浏览器页面中，受到 [outer window](https://link.zhihu.com/?target=https%3A//developer.mozilla.org/en-US/docs/Mozilla/Developer_guide/Inner_and_outer_windows) 特性的影响，`globalThis` 实际指向的是 `WindowProxy`，而不是当前页面内真实的全局对象（该对象不能被直接访问）。

## Promise.allSettled

在`Promise`上有提供一组组合方法（比如最常用到的`Promise.all`），它们都是接收多个 promise 对象，并返回一个表示组合结果的新的 promise，依据所传入 promise 的结果状态，组合后的 promise 将切换为不同的状态。

目前为止这类方法一共有如下四个，这四个方法之间仅有判断逻辑上的区别，也都有各自所适用的场景：

- `Promise.all` 返回一个组合后的 promise，当所有 promise 全部切换为 *fulfilled* 状态后，该 promise 切换为 *fulfilled* 状态；但若有任意一个 promise 切换为 *rejected* 状态，该 promise 将立即切换为 *rejected* 状态；
- `Promise.race` 返回一个组合后的 promise，当 promise 中有任意一个切换为 *fulfilled* 或 *rejected* 状态时，该 promise 将立即切换为相同状态；
- `Promise.allSettled` 返回一个组合后的 promise，当所有 promise 全部切换为 *fulfilled* 或 *rejected* 状态时，该 promise 将切换为 *fulfilled* 状态；
- `Promise.any` 返回一个组合后的 promise，当 promise 中有任意一个切换为 *fulfilled* 状态时，该 promise 将立即切换为 *fulfilled* 状态，但只有所有 promise 全部切换为 *rejected* 状态时，该 promise 才切换为 *rejected* 状态。

Promise.allSettled用法：

传入一个数组，里面放任意多个 promise 对象，并接受一个表示组合结果的新的 promise。

需要注意的是，组合后的 promise 会等待所有所传入的 promise，当它们全部切换状态后（无论是 *fulfilled* 状态 还是 *rejected* 状态），这个组合后的 promise 会切换到 *fulfilled* 状态并给出所有 promise 的结果信息：

```js
async function a() {
 
    const promiseA = fetch('/api/a')    // => rejected,  <Error: a>
    const promiseB = fetch('/api/B')    // => fulfilled, "b"

    const results = await Promise.allSettled([ promiseA, promiseB])

    results.length   // => 3
    results[0]       // => { status: "rejected", reason: <Error: a> }
    results[1]       // => { status: "fulfilled", value: "b" }
}
```

因为结果值是一个数组，所以你可以很容易地过滤出任何你感兴趣的结果信息：

```js
// 获取所有 fulfilled 状态的结果信息
results.filter( result => result.status === "fulfilled" )
// 获取所有 rejected 状态的结果信息
results.filter( result => result.status === "rejected" )
// 获取第一个 rejected 状态的结果信息
results.find( result => result.status === "rejected" )
```

使用场景如下：

1、有时候在进行一个页面的初始化流程时，需要加载多份初始化数据，或执行一些其它初始化操作，而且通常会希望等待这些初始化操作全部完成之后再执行后续流程：

```js
async function init() {
    setInited(false)
    setInitError(undefined)

    const results = await Promise.allSettled([
        loadDetail(),
        loadRecommentListFirstPage(),
        initSDK(),
    ])

    const errors = results
        .filter( result => result.status === "rejected" )
        .map( rejectedResult => rejectedResult.reason )

    if (errors.length) {
        setInitError(errors[0])
        $logs.error(errors)
    }

    setInited(true)
}
```

2、又例如我们有自定义的全局消息中心，那么还可以基于`allSettled`作一些异步支持的事情。比如在打开登录弹出层并在用户成功登录后，向页面中广播一个`login`事件，通常页面中其它地方监听到该事件后需要向服务端请求新的数据，此时我们可能需要等待数据全部更新完毕之后再关闭登录弹出层：

```js
async function login() {
    // goto login ...

    const results = messageCenter.login.emit()
    const promiseResults = results.filter(isPromise)

	if (promiseResults.length) {
        await Promise.allSettled(promiseResults)
	}

    closeLoginModal()
    closeLoading()
}
```

## for-in 结构

用于规范`for-in`语句的遍历顺序

在之前的 ES 规范中几乎没有指定 `for-in` 语句在遍历时的顺序，但各 ES 引擎的实现在大多数情况下都是趋于一致的，只有在一些边界情况时才会有所差别。我们很难能够要求各引擎做到完全一致，主要原因在于 `for-in` 是 ES 中所有遍历 API 中最复杂的一个，再加上规范的疏漏，导致各大浏览器在实现该 API 时都有很多自己特有的实现逻辑，各引擎的维护人员很难有意愿去重新审查这部分的代码。

因此规范的作者作了大量的工作，去测试了很多现有的 ES 引擎中 `for-in` 的遍历逻辑。并梳理出了它们之间一致的部分，然后将这部分补充到了 [ES 规范](https://link.zhihu.com/?target=https%3A//tc39.es/ecma262/%23sec-%foriniteratorprototype%.next) 当中。

另外，规范中还提供了一份示例代码，以供各引擎在实现 `for-in` 逻辑时参考使用，大家可以看一下：

```js
function* EnumerateObjectProperties(obj) {
    const visited = new Set();

    for (const key of Reflect.ownKeys(obj)) {
        if (typeof key === "symbol") continue;
        const desc = Reflect.getOwnPropertyDescriptor(obj, key);
        if (desc) {
            visited.add(key);
            if (desc.enumerable) yield key;
        }
    }

    const proto = Reflect.getPrototypeOf(obj);
    if (proto === null) return;

    for (const protoKey of EnumerateObjectProperties(proto)) {
        if (!visited.has(protoKey)) yield protoKey;
    }
}
```

# ECMAScript2019  ES10

全文概况：

- Array.flat()和Array.flatMap(): 数组展平
- String.trimStart()和String.trimEnd()：去掉开头结尾空格文本
- String.prototype.matchAll: 为所有匹配的匹配对象返回一个迭代器
- Symbol.prorotype.description：只读属性，回Symobol对象的可描述的字符串
- Object.formEntries()：返回一个给定对象自身可枚举属性的键值对数组
- 可选catch
- JSON Superset 超集
- Json.stringify() 加强格式转化
- Array.prototype.sort()更加稳定
- Function.prototype.toString()重新修订

## Array.flat()和Array.flatMap()

Array.flat()把数组展平，通过传入层级深度参数（默认为1），来为下层数组提升层级。如果想提升所有层级可以写一个比较大的数字甚至是`Infinity`，但不推荐这么做。

```js
[1, 2, [3, 4]].flat();
// [ 1, 2, 3, 4 ]
[1, 2, [3, 4, [5, 6]]].flat(2);
// [ 1, 2, 3, 4, 5, 6 ]
```

Array.prototype.flatMap() 它是Array.prototype.map() 和 Array.prototype.flat() 的组合，通过对map调整后的数据尝试展平操作

```js
[1, 2, [3, 4]].flatMap(v => {
  if (typeof v === 'number') {
    return v * 2
  } else {
    return v.map(v => v * 2)
  }
})
// [2, 4, 6, 8]
```

## String.trimStart()和String.trimEnd()：去掉开头结尾空格文本

把头尾的空格文本去掉，来规避展示的不受控情况。自ES5来，String.prototype.trim() 被用于去除头尾上的空格、换行符等，现在通过 trimStart()，trimEnd() 来头和尾进行单独控制。trimLeft()、trimRight() 是他们的别名

```js
const string = ' Hello ES2019! ';
string.trimStart();
// 'Hello ES2019! '
string.trimEnd();
// ' Hello ES2019!'
```

## String.prototype.matchAll

```js
const raw_arr = 'test1  test2  test3'.matchAll((/t(e)(st(\d?))/g));
const arr = [...raw_arr];
```

## Symbol.prototype.description

Symbol 是ES6中引入的基本数据类型，可以用作对象属性的标识符。描述属性是只读的，可用于获取符号对象的描述，更好了解它的作用。

```js
const symbol = Symbol('This is a Symbol');
symbol;
// Symbol(This is a Symbol)
Symbol.description;
// 'This is a Symbol' 
```

## Object.fromEntries()：返回一个给定对象自身可枚举属性的键值对数组

我们知道ES8引入了`Object.entries`把一个对象转为`[key, value]`键值对的形式，可以运用于像 Map 这种结构中。凡事有来有回，`Object.fromEntries()`用于把键值对还原成对象结构。

```js
const entries = [ ['foo', 'bar'] ];
const object = Object.fromEntries(entries);
// { foo: 'bar' }
```

## 可选 Catch

在进行`try...catch`错误处理过程中，如果没有给catch传参数的话，代码就会报错。有时候我们并不关心错误情况，如：

```js
const isValidJSON = json => {
  try {
    JSON.parse(json);
    return true;
  } catch (unusedError) {
    // Unused error parameter
    return false;
  }
};
```

在新规范中，我们可以省略catch绑定的参数和括号，更加灵活啦。

```js
const isValidJSON = json => {
  try {
    JSON.parse(json);
    return true;
  } catch {
    return false;
  }
};
```

## JSON Superset 超集

之前如果JSON字符串中包含有行分隔符(\u2028) 和段落分隔符(\u2029)，那么在解析过程中会报错。现在ES2019对它们提供了支持。

```js
JSON.parse('"\u2028"');
// SyntaxError

// ES2019
JSON.parse('"\u2028"');
// ''
```

## SON.stringify() 加强格式转化

emoji的字符长度是多少？

```js
' '.length;
```

JavaScript将emoji解释为两个字符的原因是：**UTF-16将emojis表示为两个代理项的组合**。我们的emoji用字符'\uD83D'和'\uDE0E'编码。但是如果试图单独编写这样一个字符，例如'\uD83D'，则会认为这是一个无效的文本字符串。在早期版本中，这些字符将替换为特殊字符：

```js
JSON.stringify('\uD83D');
// '"�"'
```

现在在字符代码之前插入转义字符，结果仍是可读且有效的UTF-8/UTF-16代码：

```js
JSON.stringify('\uD83D');
// '"\\ud83d"'
```

## Array.prototype.sort() 更加稳定

之前，规范允许不稳定的排序算法，如快速排序。

在之前的排序中，可能出现`[{a: 1, b: 2}, {a: 1, b: 3}...]`、`[{a: 1, b: 3}, {a: 1, b: 2}...]`等多种情况。
现在所有主流浏览器都使用稳定的排序算法。实际上，这意味着如果我们有一个对象数组，并在给定的键上对它们进行排序，那么列表中的元素将保持相对于具有相同键的其他对象的位置。

```js
let array = [
  {a: 1, b: 2},
  {a: 2, b: 2},
  {a: 1, b: 3},
  {a: 2, b: 4},
  {a: 5, b: 3}
];
array.sort((a, b) => a.a - b.a);
// [{a: 1, b: 2}, {a: 1, b: 3}...] / [{a: 1, b: 3}, {a: 1, b: 2}...]
```

## Function.prototype.toString() 重新修订

从ES2019开始，`Function.prototype.toString()`将从头到尾返回源代码中的实际文本片段。这意味着还将返回注释、空格和语法详细信息。
function /* a comment */ foo() {}
之前，`Function.prototype.toString()`只会返回了函数的主体，但没有注释和空格。

```js
foo.toString();
// 'function foo() {}'
```

现在，函数返回的结果与编写的一致：

```js
foo.toString();
// 'function /* a comment  */ foo () {}'
```

# ECMAScript2018  ES9

全文概况

- 异步迭代：await可以和for...of循环一起使用，以串行的方式运行异步操作
- Promise.finally()逻辑只可以放在一个地方，这一点像以前jQuery ajax 的complete
- Rest/Spread属性： 允许我们将一个剩余参数表示为一个数组
- 正则表达式命名捕获组：允许命名捕获组使用符号`?<name>`
- 正则表达式反向断言(lookbehind)
- 正则表达式dotAll模式：正则表达式中点.匹配除回车外的任何单字符，标记s改变这种行为，允许行终止符的出现
- 正则表达式 Unicode 转义: Unicode 属性转义形式为`\p{...}`和`\P{...}`
- 非转义序列的模板字符串：移除对 ECMAScript 在带标签的模版字符串中转义序列的语法限制

## 异步迭代

在`async/await` 的某些时刻，我们可能尝试在不同同步循环中调用异步函数。例如下面两段代码：

```js
async function process(array) {
  for (let i of array) {
    await doSomething(i);
  }
}

async function process(array) {
  array.forEach(async i => {
    await doSomething(i);
  });
}
```

ES2018引入异步迭代器（asynchronous iterators），这就像常规迭代器，除了`next()`方法返回一个Promise。因此`await`可以和`for...of`循环一起使用，以串行的方式运行异步操作。例如：

```js
async function process(array) {
  for await (let i of array) {
    doSomething(i);
  }
}
```

## Promise.finally()

一个Promise调用链要么成功到达最后一个`.then()`，要么失败触发`.catch()`。在某些情况下，你想要在无论Promise运行成功还是失败，运行相同的代码，例如清除，删除对话，关闭数据库连接等。`.finally()`允许你指定最终的逻辑：

```js
function doSomething() {
  doSomething1()
  .then(doSomething2)
  .then(doSomething3)
  .catch(err => {
    console.log(err);
  })
  .finally(() => {
    // finish here!
  });
}
```

## Rest/Spread 属性

ES2015引入了[Rest参数](https://link.zhihu.com/?target=https%3A//link.juejin.cn/%3Ftarget%3Dhttps%3A%2F%2Fdeveloper.mozilla.org%2Fzh-CN%2Fdocs%2FWeb%2FJavaScript%2FReference%2FFunctions%2FRest_parameters)和[扩展运算符](https://link.zhihu.com/?target=https%3A//link.juejin.cn/%3Ftarget%3Dhttps%3A%2F%2Fdeveloper.mozilla.org%2Fzh-CN%2Fdocs%2FWeb%2FJavaScript%2FReference%2FOperators%2FSpread_syntax)。三个点（...）仅用于数组。Rest参数语法允许我们将一个布丁数量的参数表示为一个数组。

```js
estParam(1, 2, 3, 4, 5);

function restParam(p1, p2, ...p3) {
  // p1 = 1
  // p2 = 2
  // p3 = [3, 4, 5]
}
```

展开操作符以相反的方式工作，将数组转换成可传递给函数的单独参数。例如`Math.max()`返回给定数字中的最大值：

```js
const values = [99, 100, -1, 48, 16];
console.log( Math.max(...values) ); // 100
```

ES2018为对象解构提供了和数组一样的Rest参数（）和展开操作符，一个简单的例子：

```js
const myObject = {
  a: 1,
  b: 2,
  c: 3
};

const { a, ...x } = myObject;
// a = 1
// x = { b: 2, c: 3 }

// 或可以使用它给函数传递参数
restParam({
  a: 1,
  b: 2,
  c: 3
});

function restParam({ a, ...x }) {
  // a = 1
  // x = { b: 2, c: 3 }
}
```

跟数组一样，Rest参数只能在声明的结尾处使用。此外，它只适用于每个对象的顶层，如果对象中嵌套对象则无法适用。扩展运算符可以在其他对象内使用，例如：

```js
const obj1 = { a: 1, b: 2, c: 3 };
const obj2 = { ...obj1, z: 26 };
// obj2 is { a: 1, b: 2, c: 3, z: 26 }
```

可以使用扩展运算符拷贝一个对象，像是这样`obj2 = {...obj1}`，但是**这只是一个对象的浅拷贝**。另外，如果一个对象A的属性是对象B，那么在克隆后的对象cloneB中，该属性指向对象B。

## 正则表达式命名捕获组

JavaScript正则表达式可以返回一个匹配的对象——一个包含匹配字符串的类数组，例如：以YYYY-MM-DD的格式解析日期：

```js
const reDate = /([0-9]{4})-([0-9]{2})-([0-9]{2})/,
  match  = reDate.exec('2018-04-30'),
  year   = match[1], // 2018
  month  = match[2], // 04
  day    = match[3]; // 30
```

代码很难读懂，并且改变正则表达式的结构有可能改变匹配对象的索引。ES2018允许命名捕获组使用符号`?<name>`，在打开捕获括号`(`后立即命名，示例如下：

```js
const reDate = /(?<year>[0-9]{4})-(?<month>[0-9]{2})-(?<day>[0-9]{2})/,
  match  = reDate.exec('2018-04-30'),
  year   = match.groups.year,  // 2018
  month  = match.groups.month, // 04
  day    = match.groups.day;   // 30
```

任何匹配失败的命名组都将返回`undefined`。

命名捕获也可以使用在`replace()`方法中。例如将日期转换为美国的 MM-DD-YYYY 格式：

```js
const reDate = /(?<year>[0-9]{4})-(?<month>[0-9]{2})-(?<day>[0-9]{2})/,
  d      = '2018-04-30',
usDate = d.replace(reDate, '$<month>-$<day>-$<year>');
```

## 正则表达式反向断言(lookbehind)

目前JavaScript在正则表达式中支持先行断言（lookahead）。这意味着匹配会发生，但不会有任何捕获，并且断言没有包含在整个匹配字段中。例如从价格中捕获货币符号：

```js
const reLookahead = /\D(?=\d+)/,
match = reLookahead.exec('$123.89');
console.log( match[0] ); // $
```

ES2018引入以相同方式工作但是匹配前面的反向断言（lookbehind），这样我就可以忽略货币符号，单纯的捕获价格的数字：

```js
const reLookbehind = /(?<=\D)\d+/,
match = reLookbehind.exec('$123.89');
console.log( match[0] ); // 123.89
```

## 正则表达式dotAll模式

正则表达式中点`.`匹配除回车外的任何单字符，标记`s`改变这种行为，允许行终止符的出现，例如：

```js
/hello.world/.test('hello\nworld');  // false
/hello.world/s.test('hello\nworld'); // true
```

## 正则表达式 Unicode 转义

到目前为止，在正则表达式中本地访问 Unicode 字符属性是不被允许的。ES2018添加了 Unicode 属性转义——形式为`\p{...}`和`\P{...}`，在正则表达式中使用标记 `u` (unicode) 设置，在`\p`块儿内，可以以键值对的方式设置需要匹配的属性而非具体内容。例如：

```js
const reGreekSymbol = /\p{Script=Greek}/u;
reGreekSymbol.test('π'); // true
```

这个特性可以避免使用特定 Unicode 区间来进行内容类型判断，提升可读性和可维护性。

## 非转义序列的模板字符串

ES2018 移除对 ECMAScript 在带标签的模版字符串中转义序列的语法限制。
之前，`\u`开始一个 unicode 转义，`\x`开始一个十六进制转义，`\`后跟一个数字开始一个八进制转义。这使得创建特定的字符串变得不可能，例如Windows文件路径 `C:\uuu\xxx\111`。

# ECMAScript2017  ES8

全文概况

- async/await:异步终极解决方案
- Object.values()
- Object.entries()
- String padding: String.portotype.padStart   String.prototype.padEnd
- 函数参数列表结尾允许逗号
- Object.getOwnPropertyDescriptors(): 获取一个对象的所有自身属性的描述符，如果没有任何自身属性，则返回空对象
- ShareArrayBuffer对象: 用来表示一个通用的，固定长度的原始二进制数据缓冲区
- Atomics对象：提供了一组静态方法来对SharedArrayBuffer对象进行原子操作

## async/await

async/await可以说是co模块和生成器函数的语法糖。用更加清晰的语义解决js异步代码，使得异步代码看起来像同步代码。

```js
async fetchData(query) =>{  
  try {      
    const response = await axios.get(`/query?query=${query}`); 
    const data = response.data;     
    return data;    
 }catch (error)    {      
   console.log(error)   
 }} 
fetchData(query).then(data =>{    
     this.processfetchedData(data)
})
```

## Object.values()

`Object.values()`是一个与`Object.keys()`类似的新函数，但返回的是Object自身属性的所有值，不包括继承的值。

假设我们要遍历如下对象`obj`的所有值：

```js
const obj = {a: 1, b: 2, c: 3};
// ES7
const vals=Object.keys(obj).map(key=>obj[key]);
console.log(vals);//[1, 2, 3]
// ES8
const values=Object.values(obj1);
console.log(values);//[1, 2, 3]
```

`Object.values()`省去了遍历key，并根据这些key获取value的步骤。

## Object.entries()

`Object.entries()`函数返回一个给定对象自身可枚举属性的键值对的数组。

```js
// ES7
Object.keys(obj).forEach(key=>{
    console.log('key:'+key+' value:'+obj[key]);
})
// ES8
for(let [key,value] of Object.entries(obj1)){
    console.log(`key: ${key} value:${value}`)
}
```

## String padding：String.prototype.padStart、String.prototype.padEnd

允许将空字符串或其他字符串添加到原始字符串的开头或结尾

```js
tring.padStart(targetLength,[padString])

console.log('0.0'.padStart(4,'10')) //10.0
console.log('0.0'.padStart(20))// 0.00   
```

- targetLength:当前字符串需要填充到的目标长度。如果这个数值小于当前字符串的长度，则返回当前字符串本身。
- padString:(可选)填充字符串。如果字符串太长，使填充后的字符串长度超过了目标长度，则只保留最左侧的部分，其他部分会被截断，此参数的缺省值为 " "。

```js
String.padEnd(targetLength,padString])
console.log('0.0'.padEnd(4,'0')) //0.00    
console.log('0.0'.padEnd(10,'0'))//0.00000000
```

- targetLength:当前字符串需要填充到的目标长度。如果这个数值小于当前字符串的长度，则返回当前字符串本身。
- padString:(可选) 填充字符串。如果字符串太长，使填充后的字符串长度超过了目标长度，则只保留最左侧的部分，其他部分会被截断，此参数的缺省值为 " "；

## 函数参数列表结尾允许逗号

方便使用git进行多人协作开发时修改同一个函数减少不必要的行变更。

## Object.getOwnPropertyDescriptors()

用来获取一个对象的所有自身属性的描述符,如果没有任何自身属性，则返回空对象。

```js
const obj = {
	name: 'lxm',
	get age() { return '28' }
};
Object.getOwnPropertyDescriptors(obj)
```

## SharedArrayBuffer 对象

用来表示一个通用的，固定长度的原始二进制数据缓冲区，类似于 ArrayBuffer 对象，它们都可以用来在共享内存（shared memory）上创建视图。与 ArrayBuffer 不同的是，SharedArrayBuffer 不能被分离。

## Atomics 对象

提供了一组静态方法用来对 SharedArrayBuffer 对象进行原子操作。这些原子操作属于 Atomics 模块。与一般的全局对象不同，Atomics 不是构造函数，因此不能使用 new 操作符调用，也不能将其当作函数直接调用。Atomics 的所有属性和方法都是静态的（与 Math 对象一样）

多个共享内存的线程能够同时读写同一位置上的数据。原子操作会确保正在读或写的数据的值是符合预期的，即下一个原子操作一定会在上一个原子操作结束后才会开始，其操作过程不会中断。

- Atomics.add()

将指定位置上的数组元素与给定的值相加，并返回相加前该元素的值。

- Atomics.compareExchange()

如果数组中指定的元素与给定的值相等，则将其更新为新的值，并返回该元素原先的值。

- Atomics.exchange()

将数组中指定的元素更新为给定的值，并返回该元素更新前的值。

- Atomics.load()

返回数组中指定元素的值。

- Atomics.or()

将指定位置上的数组元素与给定的值相或，并返回或操作前该元素的值。

- Atomics.store()

将数组中指定的元素设置为给定的值，并返回该值。

- Atomics.sub()

将指定位置上的数组元素与给定的值相减，并返回相减前该元素的值。

- Atomics.xor()

> 将指定位置上的数组元素与给定的值相异或，并返回异或操作前该元素的值。

wait() 和 wake() 方法采用的是 Linux 上的 futexes 模型（fast user-space mutex，快速用户空间互斥量），可以让进程一直等待直到某个特定的条件为真，主要用于实现阻塞。

- Atomics.wait()

检测数组中某个指定位置上的值是否仍然是给定值，是则保持挂起直到被唤醒或超时。返回值为 "ok"、"not-equal" 或 "time-out"。调用时，如果当前线程不允许阻塞，则会抛出异常（大多数浏览器都不允许在主线程中调用 wait()）。

- Atomics.wake()

唤醒等待队列中正在数组指定位置的元素上等待的线程。返回值为成功唤醒的线程数量。

- Atomics.isLockFree(size)

可以用来检测当前系统是否支持硬件级的原子操作。对于指定大小的数组，如果当前系统支持硬件级的原子操作，则返回 true；否则就意味着对于该数组，Atomics 对象中的各原子操作都只能用锁来实现。此函数面向的是技术专家

# ECMAScript2016  ES7

全文概况

- 数组includes()方法，用来判断一个数组是否包含一个指定的值，根据情况，如果包含则返回true，否则返回false。
- a ** b指数运算符，它与 Math.pow(a, b)相同。

## Array.prototype.includes()

includes() 函数用来判断一个数组是否包含一个指定的值，如果包含则返回 true，否则返回 false。includes 函数与 indexOf 函数很相似

下面两个表达式是等价的：

```js
list.includes(x)
// 等价于
list.indexOf(x) >= 0
```

接下来我们来判断数字中是否包含某个元素，ES7之前：

```js
let arr = ['react', 'angular', 'vue'];

if (arr.indexOf('react') !== -1)
{
    console.log('react存在');
}
```

ES7 使用 includes() 验证数组中是否存在某个元素：

```js
let arr = ['react', 'angular', 'vue'];

if (arr.includes('react'))
{
    console.log('react存在');
}
```

## 指数操作符

在ES7中引入了指数运算符`**`，`**`具有与`Math.pow(..)`等效的计算结果。

使用自定义的递归函数calculateExponent或者Math.pow()进行指数运算：

```js
function calculateExponent(base, exponent)
{
    if (exponent === 1)
    {
        return base;
    }
    else
    {
        return base * calculateExponent(base, exponent - 1);
    }
}

console.log(calculateExponent(2, 10)); // 输出1024
console.log(Math.pow(2, 10)); // 输出1024
```

# ECMAScript2015  ES6

全文概况

- let和const
- 类（class）
- 模块化(ES Module)
- 箭头（Arrow）函数
- 函数参数默认值
- 模板字符串
- 解构赋值
- 延展操作符 ...
- 对象属性简写
- Promise




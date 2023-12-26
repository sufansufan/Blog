# composition-api

## setup()

- setup()钩子是在组件中使用组合式APi的入口；
- setup()函数中返回的对象会暴露给模板和组件实例；
- 模板中访问从setup返回的ref时，它会进行浅层解包，因此你无须在模板中写.value
- setup应该同步的返回一个对象，唯一可以使用async setup()的情况是，该组件是Suspense组件的后裔

### 访问Props

setup函数的第一个参数是组件Props

**注意：** 解构props对象，解构出的变量将会丢失响应性，因此我们推荐通过props.xxx的形式

如果你确实需要解构 `props` 对象，或者需要将某个 prop 传到一个外部函数中并保持响应性，那么你可以使用 `toRefs()`和 `toRef()`这两个工具函数

```javascript
import { toRefs, toRef } from 'vue'
export default {
  setup(props) {
    // 将 `props` 转为一个其中全是 ref 的对象，然后解构
    const { title } = toRefs(props)
    // `title` 是一个追踪着 `props.title` 的 ref
    console.log(title.value)

    // 或者，将 `props` 的单个属性转为一个 ref
    const title = toRef(props, 'title')
  }
}
```

### Setup上下文

传入 `setup` 函数的第二个参数是一个 **Setup 上下文**对象。上下文对象暴露了其他一些在 `setup` 中可能会用到的值：

```javascript
export default {
  setup(props, context) {
    // 透传 Attributes（非响应式的对象，等价于 $attrs）
    console.log(context.attrs)

    // 插槽（非响应式的对象，等价于 $slots）
    console.log(context.slots)

    // 触发事件（函数，等价于 $emit）
    console.log(context.emit)

    // 暴露公共属性（函数）
    console.log(context.expose)
  }
}
```

该上下文对象是非响应式的，可以安全地解构

`attrs` 和 `slots` 都是有状态的对象，它们总是会随着组件自身的更新而更新。这意味着你应当避免解构它们，并始终通过 `attrs.x` 或 `slots.x` 的形式使用其中的属性。此外还需注意，和 `props` 不同，`attrs` 和 `slots` 的属性都**不是**响应式的。如果你想要基于 `attrs` 或 `slots` 的改变来执行副作用，那么你应该在 `onBeforeUpdate` 生命周期钩子中编写相关逻辑。

#### 暴露公共属性

`expose` 函数用于显式地限制该组件暴露出的属性，当父组件通过[模板引用](https://cn.vuejs.org/guide/essentials/template-refs.html#ref-on-component)访问该组件的实例时，将仅能访问 `expose` 函数暴露出的内容：

```javascript
export default {
  setup(props, { expose }) {
    // 让组件实例处于 “关闭状态”
    // 即不向父组件暴露任何东西
    expose()

    const publicCount = ref(0)
    const privateCount = ref(0)
    // 有选择地暴露局部状态
    expose({ count: publicCount })
  }
}
```

#### 与渲染函数一起使用

`setup` 也可以返回一个渲染函数，此时在渲染函数中可以直接使用在同一作用域下声明的响应式状态：

```javascript
import { h, ref } from 'vue'

export default {
  setup() {
    const count = ref(0)
    return () => h('div', count.value)
  }
}
```

返回一个渲染函数将会阻止我们返回其他东西。对于组件内部来说，这样没有问题，但如果我们想通过模板引用将这个组件的方法暴露给父组件，那就有问题了。

我们可以通过调用 `expose` 解决这个问题：

```javascript
import { h, ref } from 'vue'

export default {
  setup(props, { expose }) {
    const count = ref(0)
    const increment = () => ++count.value

    expose({
      increment
    })

    return () => h('div', count.value)
  }
}
```

## 核心

### ref()

接受一个内部值，返回一个响应式的、可更改的ref对象，此对象只有一个指向其内部值得属性.value

ref对象是可更改得，也就是说你可以为.value赋予得新值。它也是响应式得，即所有对`.value`得操作都将被追踪，并且写的操作会触发与之相关的副作用。

如果将一个对象赋值给`ref`，那么这个对象将通过`reacttive()`转为具有深层次响应式的对象。这也意味着如果对象包含了嵌套的ref，它们将被深层地解包。

若要避免这种深层的转换，请使用`shallowRef()`来代替。

### reactive()

返回一个对象的响应式代理

- 响应式转换时"深层"的：它会影响到所有嵌套的属性。一个响应式对象也将深层地解包任何ref属性，同时保持响应式。
- 值得注意得是，当访问到某个响应式数组或Map这样得原生集合类型中的ref元素是，不会执行ref的解包。
- 若要避免深层响应式转换，只想保理对这个对象顶层访问的响应性，请使用`shallowReactive()`作代替。
- 返回的对象以及其中嵌套的对象都会通过Es Proxy包裹，因此不等于源对象，建议只使用响应式代理，避免使用原始对象

#### reactive()的局限性

1. **有限的值类型：**  它只能用于对象类型(对象， 数组和Map、Set这样的集合类型)。它不能持有如 `String` 、`number` `boolean`这样的原型类型。
2. **不能替换整个对象：** 由于Vue的响应式跟踪是通过属性访问实现的，因此我们必须始终保持对响应式的相同引用。这意味着我们不能轻易地“替换”响应式对象，因此这样的话与第一个引用的响应性连接丢失.
3. **对解构操作不友好：** 当我们将响应式对象的原始类型属性解构为本地变量时，或者将该属性传递给函数时，我们将丢失响应式



### computed()

接受一个getter函数，返回一个只读的响应式ref对象。该ref通过`.value`暴露getter函数的返回值。他可可以接受一个带有`get`和`set`函数的对象来创建一个可写的ref对象

### watch()

监听一个或多个响应式数据源，并在数据源变化时调用所给的回调函数

`watch()`默认是懒监听的，即仅在监听源发生变化时才执行回调函数。

第一个参数是侦听器的源。这个来源可以是以下几种

- 一个函数，返回的值
- 一个ref 
- 一个响应式对象
- 或是由以上类型的值组成的数组

第二个参数是在发生变化时要调用的函数。这个回调函数接受三个参数：新值、旧值、以及一个用于注册副作用清理的回调函数。该回调函数会在副作用下一次重新执行前调用，可以用来清楚无效的副作用，例如等待中的异步请求。

当侦听多个来源时，回调函数接受两个数组，分别对应来源数组中的新值和旧值。

第三个可选的参数是一个对象，支持以下这些选项：

- `immediate`：在侦听器创建时立即触发回调。第一次调用时旧值是`undefined`.
- `deep`：如果源是对象，强制深度遍历，以便在深层级变更时触发回调。
- `flush`: 调整回调函数的刷新时机。
- `onTrack / onTrigger`调试侦听器的依赖。

与 `watchEffect`相比，`watch()` 使我们可以：

- 懒执行副作用；
- 更加明确是应该由那个状态触发侦听器重新执行；
- 可以访问所侦听器状态的前一个值和当前值；

### watchEffect()

立即运行一个函数，同时响应式地追踪其依赖，并在依赖更改时重新执行。

第一个参数就是要运行的副作用函数。这个副作用函数的参数是一个函数，用来注册清理回调，清理回调会在该副作用下一次执行前被调用，可以用来清理无效的副作用，例如等待中的异步请求。

第二个参数是一个可选的选项，可以用来调整副作用的刷新时机或者调试副作用的依赖。

默认情况下，侦听器将在组件渲染之前执行。设置`flush: 'post'` 将会使侦听器延迟到组件渲染之后在执行。在某些特殊情况下（例如要使缓存失效），可能有必要在响应式依赖发生改变时立即触发侦听器。这可以通过设置`flush: 'sync'` 来实现。然而该设置应谨慎使用，因为如果有多个属性同时更新，这将导致一些性能和数据一致性的问题，返回值是一个用来停止该副作用的函数。

### watchPostEffect()

`watchPostEffect` 使用 `flush: 'post'` 选项时的别名。

### watchSyncEffect()

`watchSyncEffect()` 使用`flush: 'sync'` 选项时的别名。

## 工具

### isRef()

检查某个值是否为 ref。

### unref()

如果参数是 ref，则返回内部值，否则返回参数本身。

这是 `val = isRef(val) ? val.value : val` 计算的一个语法糖。

### toRef()

可以将值、refs 或 getters 规范化为 refs (3.3+)。

也可以基于响应式对象上的一个属性，创建一个对应的 ref。这样创建的 ref 与其源属性保持同步：改变源属性的值将更新 ref 的值，反之亦然。

```javascript
// 按原样返回现有的 ref
toRef(existingRef)

// 创建一个只读的 ref，当访问 .value 时会调用此 getter 函数
toRef(() => props.foo)

// 从非函数的值中创建普通的 ref
// 等同于 ref(1)
toRef(1)
```

```javascript
const state = reactive({
  foo: 1,
  bar: 2
})

// 双向 ref，会与源属性同步
const fooRef = toRef(state, 'foo')

// 更改该 ref 会更新源属性
fooRef.value++
console.log(state.foo) // 2

// 更改源属性也会更新该 ref
state.foo++
console.log(fooRef.value) // 3
```

请注意，这不同于：

```javascript
const fooRef = ref(state.foo)
```

上面这个 ref **不会**和 `state.foo` 保持同步，因为这个 `ref()` 接收到的是一个纯数值。

`toRef()` 这个函数在你想把一个 prop 的 ref 传递给一个组合式函数时会很有用：

```javascript
<script setup>
import { toRef } from 'vue'

const props = defineProps(/* ... */)

// 将 `props.foo` 转换为 ref，然后传入
// 一个组合式函数
useSomeFeature(toRef(props, 'foo'))

// getter 语法——推荐在 3.3+ 版本使用
useSomeFeature(toRef(() => props.foo))
</script>
```

当 `toRef` 与组件 props 结合使用时，关于禁止对 props 做出更改的限制依然有效。尝试将新的值传递给 ref 等效于尝试直接更改 props，这是不允许的。在这种场景下，你可能可以考虑使用带有 `get` 和 `set` 的 `computed` 替代。

当使用对象属性签名时，即使源属性当前不存在，`toRef()` 也会返回一个可用的 ref。这让它在处理可选 props 的时候格外实用，相比之下 `toRefs` 就不会为可选 props 创建对应的 refs。

### toRefs()

将一个响应式对象转换为一个普通对象，这个普通对象的每个属性都是指向源对象相应属性的ref。每个单独的ref都是使用`toRef()`创建的

**示例**

````javascript
const state = reactive({
  foo: 1,
  bar: 2
})

const stateAsRefs = toRefs(state)
/*
stateAsRefs 的类型：{
  foo: Ref<number>,
  bar: Ref<number>
}
*/

// 这个 ref 和源属性已经“链接上了”
state.foo++
console.log(stateAsRefs.foo.value) // 2

stateAsRefs.foo.value++
console.log(state.foo) // 3
````

当从组合式函数中返回响应式对象时，`toRefs` 相当有用。使用它，消费者组件可以解构/展开返回的对象而不会失去响应性：

```javascript
function useFeatureX() {
  const state = reactive({
    foo: 1,
    bar: 2
  })

  // ...基于状态的操作逻辑

  // 在返回时都转为 ref
  return toRefs(state)
}

// 可以解构而不会失去响应性
const { foo, bar } = useFeatureX()
```

`toRefs` 在调用时只会为源对象上可以枚举的属性创建 ref。如果要为可能还不存在的属性创建 ref，请改用 `toRef`

### toValue() 3.3+

将值、refs或getters规范化值。这与unref()类似，不同的是此函数也会规划化getter函数。如果参数是一个getter，它将会被调用并且返回它的返回值。

这个可以在组合式函数中使用，用来规范化一个可以是值、ref或getter的参数。

**示例：**

~~~javascript
toValue(1) //       --> 1
toValue(ref(1)) //  --> 1
toValue(() => 1) // --> 1
~~~

在组合式函数中规范化参数

```javascript
import type { MaybeRefOrGetter } from 'vue'

function useFeature(id: MaybeRefOrGetter<number>) {
  watch(() => toValue(id), id => {
    // 处理 id 变更
  })
}

// 这个组合式函数支持以下的任意形式：
useFeature(1)
useFeature(ref(1))
useFeature(() => 1)
```

### isProxy()

检查一个对象是否是由`reactive()`、`readonly()`、`shallowReactive()`或者`shallowReadonly()`

创建代理。

### isReactive()

检查一个对象是否由`reactuve()`或`shallowReactive()`创建的代理

### isReadonly()

检查传入的值是否为只读对象，只读对象的属性可以更改，但他们不能通过传入的对象直接赋值。

通过`readonly()`和`shallowReadonly()`创建的代理都是只读的，因为他们是没有set函数的`computed()`ref.

## 进阶

### shallowRef()

`ref()`的浅层作用形式

和`ref()`不同，浅层ref的内部值将会原样存储和暴露，并且不会被深层递归地转化为响应式。只有对`.value`地访问是响应式地。

`shallowRef()`常常用于对大型数据结构地性能优化或是与外部地状态管理集成。

```javascript
const state = shallowRef({ count: 1 })

// 不会触发更改
state.value.count = 2

// 会触发更改
state.value = { count: 2 }
```

#### 减少大型不可变数据的响应性开销

Vue的响应性系统默认是深度的，虽然这让状态管理变得更直观，但是数据量巨大时，深度深度响应性也会导致不小得性能负担，因为每个属性访问都会触发代理得依赖追踪，好在这种性能负担通常只有在处理超大型数组或层级很深得对象时，例如一次渲染访问100000+个属性时，才会变得比较明显。因此，它只会影响少数场景。

Vue确实为此提供了一种解决方案，通过使用`shallowRef()`和`shallowReactive()`来绕开深度响应。浅层式得API创建得状态只在其顶层是响应式得，对所有深层得对象不会做任何处理。这使得对深层级属性得访问变得更快，但代价是，我们现在必须将所有深层级对象视为不可变得，并且只能通过替换整个根状态来触发更新：

```javascript
const shallowArray = shallowRef([
  /* 巨大的列表，里面包含深层的对象 */
])

// 这不会触发更新...
shallowArray.value.push(newObject)
// 这才会触发更新
shallowArray.value = [...shallowArray.value, newObject]

// 这不会触发更新...
shallowArray.value[0].foo = 1
// 这才会触发更新
shallowArray.value = [
  {
    ...shallowArray.value[0],
    foo: 1
  },
  ...shallowArray.value.slice(1)
]
```

#### 与外部状态系统集成

Vue的响应性系统是通过深度转换普通 JavaScript 对象为响应式代理来实现的。这种深度转换在一些情况下是不必要的，在和一些外部状态管理系统集成时，甚至是需要避免的 (例如，当一个外部的解决方案也用了 Proxy 时)。

将Vue的响应性系统与外部状态管理方案集成的大致思路是：将外部放一个`shallowRef`中。一个浅层的ref中只有它的`.value`属性本身被访问是才是有响应性的，而不是关心它内部的值。当外部状态改变时，替换此ref的`.value`才会触发更新。

##### 不可变数据

如果你正在实现一个撤销/重做的功能，你可能想要对用户编辑时应用的状态进行快照记录。然而，如果状态树很大的话，Vue 的可变响应性系统没法很好地处理这种情况，因为在每次更新时都序列化整个状态对象对 CPU 和内存开销来说都是非常昂贵的。

`不可变数据结构`通过永不更改状态对象来解决这个问题。与Vue不同的是，它会创建一个新对象，保留旧的对象未发生改变的一部分。在 JavaScript 中有多种不同的方式来使用不可变数据，但我们推荐使用 [Immer](https://immerjs.github.io/immer/) 搭配 Vue，因为它使你可以在保持原有直观、可变的语法的同时，使用不可变数据。

我们可以通过一个简单的组合式函数来集成 Immer

```javascript
import produce from 'immer'
import { shallowRef } from 'vue'

export function useImmer(baseState) {
  const state = shallowRef(baseState)
  const update = (updater) => {
    state.value = produce(state.value, updater)
  }

  return [state, update]
}
```

##### 状态机

状态机是一种数据模型，用于描述应用可能处于的所有状态，以及从一种状态换到另一种状态的所有可能方式。虽然对于简单的组件来说，这可能有些小题大做了，但它的确可以是得复杂得状态流更加健壮和易于管理

[XState](https://xstate.js.org/)是 JavaScript 中一个比较常用的状态机实现方案。这里是集成它的一个例子：

```javascript
import { createMachine, interpret } from 'xstate'
import { shallowRef } from 'vue'

export function useMachine(options) {
  const machine = createMachine(options)
  const state = shallowRef(machine.initialState)
  const service = interpret(machine)
    .onTransition((newState) => (state.value = newState))
    .start()
  const send = (event) => service.send(event)

  return [state, send]
}
```

##### RxJS

[RxJS](https://rxjs.dev/) 是一个用于处理异步事件流的库。[VueUse](https://vueuse.org/) 库提供了 [`@vueuse/rxjs`](https://vueuse.org/rxjs/readme.html) 扩展来支持连接 RxJS 流与 Vue 的响应性系统。

### triggerRef()

强制触发依赖于一个浅层ref的副作用，这通常在对浅引用的内部值进行深度变更后使用

```javascript
const shallow = shallowRef({
  greet: 'Hello, world'
})

// 触发该副作用第一次应该会打印 "Hello, world"
watchEffect(() => {
  console.log(shallow.value.greet)
})

// 这次变更不应触发副作用，因为这个 ref 是浅层的
shallow.value.greet = 'Hello, universe'

// 打印 "Hello, universe"
triggerRef(shallow)
```

### customRef()

创建一个自定义的ref，显式声明对其依赖追踪和更新触发的控制方式。

**类型**

```javascript
function customRef<T>(factory: CustomRefFactory<T>): Ref<T>

type CustomRefFactory<T> = (
  track: () => void,
  trigger: () => void
) => {
  get: () => T
  set: (value: T) => void
}
```

`customRef()`预期接收一个工厂函数作为参数，这个工厂函数接接受`track`和`trigger`两个函数作为参数，并返回一个带有`get`和`set`方法对象。

一般来说，`track`应该在`get()`方法中调用，而`trigger()`应该在`set()`中调用。然而事实上，你对何时调用、是否应该调用他们有完全的控制权。

**示例**

创建一个防抖 ref，即只在最近一次 set 调用后的一段固定间隔后再调用：

```javascript
import { customRef } from 'vue'

export function useDebouncedRef(value, delay = 200) {
  let timeout
  return customRef((track, trigger) => {
    return {
      get() {
        track()
        return value
      },
      set(newValue) {
        clearTimeout(timeout)
        timeout = setTimeout(() => {
          value = newValue
          trigger()
        }, delay)
      }
    }
  })
}
```

在组件中使用：

```javascript
<script setup>
import { useDebouncedRef } from './debouncedRef'
const text = useDebouncedRef('hello')
</script>

<template>
  <input v-model="text" />
</template>
```

### shallowReactive()

`reactive()`的浅层作用形式

和 `reactive()` 不同，这里没有深层级的转换：一个浅层响应式对象里只有根级别的属性是响应式的。属性的值会被原样存储和暴露，这也意味着值为 ref 的属性**不会**被自动解包了。

```javascript
const state = shallowReactive({
  foo: 1,
  nested: {
    bar: 2
  }
})

// 更改状态自身的属性是响应式的
state.foo++

// ...但下层嵌套对象不会被转为响应式
isReactive(state.nested) // false

// 不是响应式的
state.nested.bar++
```

### shallowReadonly()

`readonly()`的浅层作用形式

和`readonly()`不同，这里没有深层的转换：只有根层级的属性变为只读。属性的值都是被原样存储和暴露，这也意味着值为ref的属性不会自动解包了

```javascript
const state = shallowReadonly({
  foo: 1,
  nested: {
    bar: 2
  }
})

// 更改状态自身的属性会失败
state.foo++

// ...但可以更改下层嵌套对象
isReadonly(state.nested) // false

// 这是可以通过的
state.nested.bar++
```

### roRaw()

根据一个Vue创建的代理返回其原始对象。

`toRaw()`可以返回由`reactive()`、`readonly()`、`shallowReactive()`或者 `shallowReadonly()`创建的代理对应的原始对象。

这是一个可以用于临时读取而不引起代理访问/跟踪开销，或是写入而不触发更改的特殊方法。不建议保存对原始对象的持久引用，请谨慎使用。

```javascript
const foo = {}
const reactiveFoo = reactive(foo)

console.log(toRaw(reactiveFoo) === foo) // true
```

### markRaw()

将一个对象标记为不可被转为代理。返回该对象本身。

**类型**

```typescript
function markRaw<T extends object>(value: T): T
```

**示例**

```javascript
const foo = markRaw({})
console.log(isReactive(reactive(foo))) // false

// 也适用于嵌套在其他响应性对象
const bar = reactive({ foo })
console.log(isReactive(bar.foo)) // false
```

```javascript
const foo = markRaw({
  nested: {}
})

const bar = reactive({
  // 尽管 `foo` 被标记为了原始对象，但 foo.nested 却没有
  nested: foo.nested
})

console.log(foo.nested === bar.nested) // false
```

### effectScope()

创建一个Effect作用域，可以捕获其中所创建的响应式副作用（即计算属性和侦听器），这样捕获到的副作用可以一起处理。对于该API的使用细节，，请查阅对应的 [RFC](https://github.com/vuejs/rfcs/blob/master/active-rfcs/0041-reactivity-effect-scope.md)。

**类型**

```javascript
function effectScope(detached?: boolean): EffectScope

interface EffectScope {
  run<T>(fn: () => T): T | undefined // 如果作用域不活跃就为 undefined
  stop(): void
}
```

**示例**

```javascript
const scope = effectScope()

scope.run(() => {
  const doubled = computed(() => counter.value * 2)

  watch(doubled, () => console.log(doubled.value))

  watchEffect(() => console.log('Count: ', doubled.value))
})

// 处理掉当前作用域内的所有 effect
scope.stop()
```

### getCurrentScope()

如果有的话，返回当前活跃的 effect 作用域

**类型**

```typescript
function getCurrentScope(): EffectScope | undefined
```

### onScopeDispose()

在当前活跃的Effect作用域上注册一个处理回调函数。当相关的Effect作用域停止时会调用这个回调函数。

这个方法可以作为可复用的组合函数中的`onUnmounted` 的替代品它并不与组件耦合，因为每一个 Vue 组件的 `setup()` 函数也是在一个 effect 作用域中调用的。

```typescript
function onScopeDispose(fn: () => void): void
```

## 生命周期钩子

### onMounted()

注册一个回调函数，在组件挂载完成后执行。

**这个钩子在服务器端渲染期间不会被调用。**

### onUpdated()

注册一个回调函数，在组件因为响应式状态变更而更新其 DOM 树之后调用。

父组件的更新钩子将在其子组件的更新钩子之后调用。

这个钩子会在组件的任意 DOM 更新后被调用，这些更新可能是由不同的状态变更导致的，因为多个状态变更可以在同一个渲染周期中批量执行（考虑到性能因素）。如果你需要在某个特定的状态更改后访问更新后的 DOM，请使用 [nextTick()](https://cn.vuejs.org/api/general.html#nexttick) 作为替代。

**这个钩子在服务器端渲染期间不会被调用。**

### onUnmounted()

注册一个回调函数，在组件实例被卸载之后调用。

**这个钩子在服务器端渲染期间不会被调用。**

### onBeforeMount()

注册一个钩子，在组件被挂载之前被调用。

当这个钩子被调用时，组件已经完成了其响应式状态的设置，但还没有创建 DOM 节点。它即将首次执行 DOM 渲染过程。

**这个钩子在服务器端渲染期间不会被调用。**

### onBeforeUpdate()

注册一个钩子，在组件即将因为响应式状态变更而更新其 DOM 树之前调用。

这个钩子可以用来在 Vue 更新 DOM 之前访问 DOM 状态。在这个钩子中更改状态也是安全的。

**这个钩子在服务器端渲染期间不会被调用。**

### onBeforeUnmount()

注册一个钩子，在组件实例被卸载之前调用。

当这个钩子被调用时，组件实例依然还保有全部的功能。

**这个钩子在服务器端渲染期间不会被调用。**

### onErrorCaptured()

注册一个钩子，在捕获了后代组件传递的错误时调用。

错误可以从以下几个来源中捕获：

- 组件渲染
- 事件处理器
- 生命周期钩子
- `setup()` 函数
- 侦听器
- 自定义指令钩子
- 过渡钩子

这个钩子带有三个实参：错误对象、触发该错误的组件实例，以及一个说明错误来源类型的信息字符串。

你可以在 `errorCaptured()` 中更改组件状态来为用户显示一个错误状态。注意不要让错误状态再次渲染导致本次错误的内容，否则组件会陷入无限循环。

这个钩子可以通过返回 `false` 来阻止错误继续向上传递。请看下方的传递细节介绍。

**错误传递规则**

- 默认情况下，所有的错误都会被发送到应用级的 [`app.config.errorHandler`](https://cn.vuejs.org/api/application.html#app-config-errorhandler) (前提是这个函数已经定义)，这样这些错误都能在一个统一的地方报告给分析服务。
- 如果组件的继承链或组件链上存在多个 `errorCaptured` 钩子，对于同一个错误，这些钩子会被按从底至上的顺序一一调用。这个过程被称为“向上传递”，类似于原生 DOM 事件的冒泡机制。
- 如果 `errorCaptured` 钩子本身抛出了一个错误，那么这个错误和原来捕获到的错误都将被发送到 `app.config.errorHandler`。
- `errorCaptured` 钩子可以通过返回 `false` 来阻止错误继续向上传递。即表示“这个错误已经被处理了，应当被忽略”，它将阻止其他的 `errorCaptured` 钩子或 `app.config.errorHandler` 因这个错误而被调用。

### onRenderTracked()  devonly

注册一个调试钩子，当组件渲染过程中追踪到响应式依赖时调用。

**这个钩子仅在开发模式下可用，且在服务器端渲染期间不会被调用。**

### onRendTriggered()  dev only

注册一个调试钩子，当响应式依赖的变更触发了组件渲染时调用。

**这个钩子仅在开发模式下可用，且在服务器端渲染期间不会被调用。**

### onActivated()

注册一个回调函数，若组件实例是 <KeepAlive>缓存树的一部分，当组件被插入到 DOM 中时调用。

**这个钩子在服务器端渲染期间不会被调用。**

### onDeactivated()

注册一个回调函数，若组件实例是  <KeepAlive>缓存树的一部分，当组件从 DOM 中被移除时调用。

### onServerPrefetch()

## 依赖注入

### provide()

提供一个值，可以被后代组件注入。

`provide()` 接受两个参数：第一个参数是要注入的 key，可以是一个字符串或者一个 symbol，第二个参数是要注入的值。

当使用 TypeScript 时，key 可以是一个被类型断言为 `InjectionKey` 的 symbol。`InjectionKey` 是一个 Vue 提供的工具类型，继承自 `Symbol`，可以用来同步 `provide()` 和 `inject()` 之间值的类型。

与注册生命周期钩子的 API 类似，`provide()` 必须在组件的 `setup()` 阶段同步调用。

```javascript
<script setup>
import { ref, provide } from 'vue'
import { countSymbol } from './injectionSymbols'

// 提供静态值
provide('path', '/project/')

// 提供响应式的值
const count = ref(0)
provide('count', count)

// 提供时将 Symbol 作为 key
provide(countSymbol, count)
</script>
```

### inject()

注入一个由祖先组件或整个应用 (通过 `app.provide()`) 提供的值。

```javascript
<script setup>
import { ref, provide } from 'vue'
import { countSymbol } from './injectionSymbols'

// 提供静态值
provide('path', '/project/')

// 提供响应式的值
const count = ref(0)
provide('count', count)

// 提供时将 Symbol 作为 key
provide(countSymbol, count)
</script>
```

### inject()

注入一个由祖先组件或整个应用（通过`app.provied()`）提供的值

**类型**

```javascript
// 没有默认值
function inject<T>(key: InjectionKey<T> | string): T | undefined

// 带有默认值
function inject<T>(key: InjectionKey<T> | string, defaultValue: T): T

// 使用工厂函数
function inject<T>(
  key: InjectionKey<T> | string,
  defaultValue: () => T,
  treatDefaultAsFactory: true
): T
```

第一个参数是注入的key。Vue会遍历父组件链，通过匹配key来确定所提供的值。如果父组件链多个组件对同一个key提供了值，那么离得更近得组件将会“覆盖”链上更远的组件所提供的值。如果没有能通过key匹配到值， `inject()`将返回underfined， 除非提供了一个默认值。

第二个参数是可选的，即在没有匹配到key时使用默认值。

第二个参数也可以是一个工厂函数，用来返回某些创建起来比较复杂的值。在这种情况下，你必须将`true`作为第三个参数出入，表明这个函数将作为工厂函数使用，而非值本身。

与注册生命周期钩子的API类似，`inject()`必须在组件的`setup()`阶段同步调用。

当使用 TypeScript 时，key 可以是一个类型为 `InjectionKey` 的 symbol。`InjectionKey` 是一个 Vue 提供的工具类型，继承自 `Symbol`，可以用来同步 `provide()` 和 `inject()` 之间值的类型。

**示例**

```javascript
<script setup>
import { inject } from 'vue'
import { countSymbol } from './injectionSymbols'

// 注入不含默认值的静态值
const path = inject('path')

// 注入响应式的值
const count = inject('count')

// 通过 Symbol 类型的 key 注入
const count2 = inject(countSymbol)

// 注入一个值，若为空则使用提供的默认值
const bar = inject('path', '/default-path')

// 注入一个值，若为空则使用提供的函数类型的默认值
const fn = inject('function', () => {})

// 注入一个值，若为空则使用提供的工厂函数
const baz = inject('factory', () => new ExpensiveObject(), true)
</script>
```

### hasInjectionContext()  3.3+

如果`inject()`可以在错误的的地方（例如`setup()`之外）被调用而不触发警告， 则返回`ture`。此方法适用于希望在内部使用`inject()`而不向用户发出警告的库。

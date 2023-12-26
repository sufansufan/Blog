# Vue3.3

## 依赖更新

- `volar/vue-tsc@^1.6.4`
- `vite@^4.3.5`
- `@vitejs/plugin-vue@^4.2.0`
- `vue-loader@^17.1.0`（如果使用了 webpack/vue-cli）

## 版本更新

1. 优化`<scripr setup>` + TS DX(开发体验)
   - 支持宏中的导入类型和复杂类型
   - 泛型组件
   - 更符合人体工学的`definedEmits`
   - 携带`definedSlots`的类型插槽
2. 实验性功能
   - 响应式`props`解构
   - `defineModel`
3. 其他重要功能
   - `defineOptions`
   - 更好地支持`getter`与`toValue`一起使用
   - 支持JSX导入源
4. 优化维护基建

### 优化`<scripr setup>` + TS DX(开发体验)

#### 支持宏中的导入类型和复杂类型

以前，`defineProps` 和 `defineEmits` 类型参数位置中使用的类型仅限于局部类型，并且能且仅能支持类型字面量和接口。这是因为，Vue 需要分析 `props` 接口上的属性，生成相应的运行时选项。

```javascript
<script setup> 
import type { Props } from './foo

// 导入 + 交又类型
defineProps<Props 8 { extraProp?: string }>()
</script>
```

请注意，复杂类型支持基于 AST，因此无法 100% 全面支持。某些需要实际类型分析的复杂类型，比如支持条件类型，并无法支持。您可以对单个 `props` 的类型使用条件类型，但不能对整个 `props` 对象使用。

#### 泛型组件

使用了`script setup` 的组件现在可以通过`generic`属性接受泛型类型参数

```javascript
<script setup lang="ts" generic="T">  
defineProps<{
    titems: T[]
    selected: T
}>()
</script>

```

`generic` 的值与 TS 中 `<...>` 之间的参数列表完全相同。举个栗子，您可以使用多个参数、`extends 约束`、默认类型和引用导入类型：

```javascript
<script setup lang="ts" generic="T extends string number, U extends Item">
import type  Item ] from  './types'
defineProps<{
    id: T
    list: U[]
}>()
</script>
```

此功能以前需要显式选用，但现在最新版本的 `volar/vue-tsc` 默认启用。

#### 更符合人体工学的`definedEmits`

以前，`defineEmits` 的类型参数能且仅能支持调用签名语法：

```javascript
// 以前
const emit = defineEmits<{
  (e: 'foo', id: number): void
  (e: 'bar', name: string, ...rest: any[]): void
}>()
```

该类型匹配 `emit` 的返回类型，但有点冗长且难以编写。Vue 3.3 引入了一种更符合人体工程学的 `emits` 类型声明方式：

```javascript
const emit = defineEmits<{
  foo: [id: number]
  bar: [name: string, ...rest: any[]]
}>()
```

在类型字面量中，键是事件名称，值是指定额外参数的数组类型。尽管这不是必需的，但您可以使用标签元组元素来明确，如上所示。

调用签名语法仍然支持

```javascript
<script setup lang="ts">
defineSlots<{
  default?: (props: { masg: string }) => any 
  item?: (props: { id: number }) => any
}>
</script>
```

#### 携带`definedSlots`的类型插槽

新的 `defineSlots` 宏可用于声明预期插槽及其各自的预期插槽 `props`：

`defineSlots()` 能且仅能接受类型参数，而不是运行时参数。类型参数应该是类型字面量，其中属性键是插槽名，值是插槽函数。函数的首参是插槽期望接收的 `props`，其类型将用于模板中的插槽 `props`。`defineSlots` 的返回值与 `useSlots` 返回的插槽对象相同。

目前的某些限制：

- `volar/vue-tsc` 中尚未实现所需的插槽检查。
- 插槽函数返回类型目前被忽略，且可以是 `any`，但我们将来可能会利用它来检查插槽内容。

还有一个相应的 `slots` 选项供 `defineComponent` 使用。这两个 API 都没有运行时影响，纯粹用作 IDE 和 `vue-tsc` 的类型提示。

### 实验性功能

#### 响应式props解构

响应式Props解构以前是响应性转换（现在已废弃）的一部分，现在已经抽离为一个单独的功能。

该功能允许解构的props保留响应性，并提供更符合人体工学的方式来声明props默认值

此功能是实验性的，需要显式选用。

#### defineModel

以前，对于支持与`v-model`双向绑定的组件，它需要：

1. 声明一个prop
2. 在打算更新该prop时触发相应的`update:propName`事件

```javascript
// 之前
<script setup >
const props = defineProps(['modelValue'])
const emit = defineEmits(['update:modelValue'])
console.log(props.modelValue)
function onInput(e) {
  emit('update:modelValue', e.target.value)
}
</script>
<template>
  <input :value="modelVlau" @input="onInput"></input>
</template>
```

```javascript
// 之后
<script setup >
const modelValue = defineModel()
console.log(modelValue.value)
</script>
<template>
  <input v-model="modelValue"></input>
</template>
```

### 其他重要功能

#### defineOptions

新的 `defineOptions` 宏允许直接在 `<script setup>` 中声明组件选项，而不需要单独的 `<script>` 块：

```javascript
<script setup >
defineOptions({
  inheritAttrs: false
})
</script>
```

#### 更好地支持`getter`与`toValue`一起使用

`toRef` 已增强，支持将值/`getter`/现有 `ref` 标准化为 `ref`：

```javascript
// 等价于 ref(1)
toRef(1)
// 创建一个只读 ref，它通过访问 .value 调用 getter
toRef(() => props.foo)
// 原样返回现有 ref
toRef(existingRef)
```

使用 `getter` 调用 `toRef` 与 `computed` 类似，但当 `getter` 仅执行属性访问而不进行昂贵的计算时，效率会更高。

新的 `toValue` 工具方法提供了相反的功能，将值/`getter`/`ref` 标准化为值：

```javascript
toValue(1) //       --> 1
toValue(ref(1)) //  --> 1
toValue(() => 1) // --> 1
```

`toValue` 可以在组合式函数中代替 `unref`，以便您的组合式函数可以接受 `getter` 作为响应式数据源：

```javascript
// 之前：分配不必要的中间 ref
useFeature(computed(() => props.foo))
useFeature(toRef(props, 'foo'))

// 之后：更高效精简
useFeature(() => props.foo)

```

`toRef` 和 `toValue` 之间的关系类似于 `ref` 和 `unref` 之间的关系，主要区别在于 `getter` 函数的特殊处理。

#### 支持JSX导入源

此版本建立在一大坨维护基建优化的基础上，使我们能够昂首先前：

- 通过将类型检查与 rollup 构建分开并从 `rollup-plugin-typescript2` 迁移到 `rollup-plugin-esbuild`，构建速度提高了 10 倍。
- 从 Jest 迁移到 Vitest，测试速度更快。
- 从 `@microsoft/api-extractor` 迁移到 `rollup-plugin-dts`，更快地生成类型。
- 通过 ecosystem-ci 进行综合回归测试 —— 在发布前捕获主要生态系统依赖的回归！

依计行事，我们的目标是在今年开始发布更小、更频繁的功能版本。敬请期待s！
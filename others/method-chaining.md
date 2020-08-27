# 在 JavaScript 中实现链式调用

链式调用在 JavaScript 语言界很常见，如 jQuery、Promise 等，都是使用的链式调用。链式调用可以让我们在进行连续操作时，写出更简洁的代码。

```js
new Promise((resolve, reject) => {
  resolve();
})
  .then(() => {
    throw new Error('Something failed');
  })
  .then(() => {
    console.log('Do this whatever happened before');
  })
  .catch(() => {
    console.log('Do that');
  });
```

## 逐步实现链式调用

假设，我们要实现一个 math 模块，使之能够支持链式调用：

```js
const math = require('math');
const a = math.add(2, 4).minus(3).times(2);
const b = math.add(2, 4).times(3).divide(2);
const c = { a, b };

console.log(a.times(2) + b + 1); // 22
console.log(a.times(2) + b + 2); // 23
console.log(JSON.stringify(c)); // {"a":6,"b":9}
```

### 基本的链式调用

链式调用通常的实现方式，就是在函数调用结果返回模块本身。那么 math 模块的代码大致应该是这样子的：

```js
export default {
  add(...args) {
    // add
    return this;
  },
  minus(...args) {
    // minus
    return this;
  },
  times(...args) {
    // times
    return this;
  },
  divide(...args) {
    // divide
    return this;
  },
};
```

### 方法如何返回值

上述代码实现了链式调用，但是也存在一个问题，就是无法获取计算结果。所以我们需要对模块进行改造，使用一个内部变量来存储计算结果。

```js
export default {
  value: NaN,
  add(...args) {
    this.value = args.reduce((pv, cv) => pv + cv, this.value || 0);
    return this;
  },
};
```

这样，我们在最后一步，通过 .value 就可以拿到最终的计算结果了。

### 问题真的解决了吗？

上面我们看似通过一个 value 变量解决了存储计算结果的问题，但是发生第二次链式调用时， value 的值因为已经有了初始值，我们会得到错误的计算结果！

```js
const a = math.add(5, 6).value; // 11
const b = math.add(5, 7).value; // 23 而非 12
```

既然是因为 value 有了初始值，那么能不能在获取 value 的值时重置掉呢？答案是不能，因为我们并不能确定使用者会在什么时候取值。

另外一种思路是在每次链式调用之前生成一个新的实例，这样就可以确保实例之间相互独立了。

```js
const math = function () {
  if (!(this instanceof math)) return new math();
};

math.prototype.value = NaN;

math.prototype.add = function (...args) {
  this.value = args.reduce((pv, cv) => pv + cv, this.value || 0);
  return this;
};

const a = math().add(5, 6).value;
const b = math().add(5, 7).value;
```

但是这样也不能彻底解决问题，假设我们如下调用：

```js
const m = math().add(5, 6);
const c = m.add(5).value; // 16
const d = m.add(5).value; // 21 而非 16
```

所以，最终要解决这个问题，只能每个方法都返回一个新的实例，这样可确保无论怎么调用，相互之间都不会被干扰到。

```js
math.prototype.add = function (...args) {
  const instance = math();
  instance.value = args.reduce((pv, cv) => pv + cv, this.value || 0);
  return instance;
};
```

### 如何支持不通过 .value 对结果进行普通运算

通过改造 valueOf 方法或者 Symbol.toPrimitive 方法。其中 Symbol.toPrimitive 方法优先 valueOf 方法被调用，除非是 ES 环境不支持。

### 如何支持 JSON.stringify 序列化计算结果

通过自定义 toJSON 方法。JSON.stringify 将值转换为相应的 JSON 格式时，如果被转换值有 toJSON 方法，则优先使用该方法返回的值。

## 最终的完整实现代码

```js
class Math {
  constructor(value) {
    let hasInitValue = true;
    if (value === undefined) {
      value = NaN;
      hasInitValue = false;
    }
    Object.defineProperties(this, {
      value: {
        enumerable: true,
        value: value,
      },
      hasInitValue: {
        enumerable: false,
        value: hasInitValue,
      },
    });
  }

  add(...args) {
    const init = this.hasInitValue ? this.value : args.shift();
    const value = args.reduce((pv, cv) => pv + cv, init);
    return new Math(value);
  }

  minus(...args) {
    const init = this.hasInitValue ? this.value : args.shift();
    const value = args.reduce((pv, cv) => pv - cv, init);
    return new Math(value);
  }

  times(...args) {
    const init = this.hasInitValue ? this.value : args.shift();
    const value = args.reduce((pv, cv) => pv * cv, init);
    return new Math(value);
  }

  divide(...args) {
    const init = this.hasInitValue ? this.value : args.shift();
    const value = args.reduce((pv, cv) => pv / cv, init);
    return new Math(value);
  }

  toJSON() {
    return this.valueOf();
  }

  toString() {
    return String(this.valueOf());
  }

  valueOf() {
    return this.value;
  }

  [Symbol.toPrimitive](hint) {
    const value = this.value;
    if (hint === 'string') {
      return String(value);
    } else {
      return value;
    }
  }
}

export default new Math();
```

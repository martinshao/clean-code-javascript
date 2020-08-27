# 代码整洁之道 (javascript 版本)

## 目录

1. 简介
2. 变量
3. 函数
4. 对象和数据结构
5. 类
6. SOLID 和设计模式
7. 测试
8. 并发
9. 错误处理
10. 格式化
11. 注释

## 简介

![](./assets/clean-code.jpg)

相信大家对这本 Robert C. Martin 的《代码整洁之道》应该都耳熟能详，但书中所使用的编程语言是 java。本项目所有内容来自于该书，同时用 JavaScript 语言重新进行描述。这不是一个编码风格指南，而是用于指导大家在用 JavaScript 开发时，如何编写有可读性、可复用性和可重构代码的指南。

本文涉及到的所有编码原则都是属于指导性质，并不严格要求大家遵守，但至少能够得到大多数人的认同，毕竟都是行业前辈们多年开发经验汇集而成的。

我们的软件工程技术只有 50 多年的历史，并且仍然保持着高速的发展，这些积累导致我们需要学习很多东西。当软件架构和架构本身一样古老时，也许我们会更难遵循规则。现在，让这些准则作为一个试金石，用来评估您和您团队编写的 JavaScript 代码的质量。

还有一件事情：了解这些编码原则并不会让人成为一个优秀的软件工程师，实际上，即使抱着这些原则从事开发多年仍然避免不了犯错。跟雕塑一样，每一段代码开始的时候会跟湿黏土一样，但是最后，当我们重新回顾的时候，把那些不完美的地方不断凿刻修饰，最终会趋于完善。另外，不要因为最初的代码需要修改就自责，让更好的代码去替代他们才是我们最应该做的事情。

## 变量

### 使用有意义，具备可读性的变量名

**Bad:**

```js
const yyyymmdstr = moment().format('YYYY/MM/DD');
```

**Good:**

```js
const currentDate = moment().format('YYYY/MM/DD');
```

⬆[back to top](#table-of-contents)

### 相同类型的变量要使用一样的单词

**Bad:**

```js
getUserInfo();
getClientData();
getCustomerRecord();
```

**Good:**

```js
getUser();
```

### 使用可检索的命名

我们会读到比写的更多的代码。所以要求我们编写的代码是可读和可检索的。如果不对帮助我们理解程序意义的变量命名，这是对后面工程阅读代码的一种伤害。让我们的变量名可以搜索，并且相关原则的检测可以通过 buddy.js 和 ESLint

**Bad:**

```js
// 这里的 86400000 到底是什么意思？
setTimeout(blastOff, 86400000);
```

```js
// 声明成一个常量，变量名有明确含义，命名方法是全大写，并且用下划线分割
const MILLISECONDS_IN_A_DAY = 86400000;

// 这样是不是好很多，而且具备可读性
setTimeout(blastOff, MILLISECONDS_IN_A_DAY);
```

### 使用自解释的变量名

**Bad:**

```js
const address = 'One Infinite Loop, Cupertino 95014';
const cityZipCodeRegex = /^[^,\\]+[,\\\s]+(.+?)\s*(\d{5})?$/;
saveCityZipCode(
  address.match(cityZipCodeRegex)[1],
  address.match(cityZipCodeRegex)[2]
);
```

**Good:**

```js
const address = 'One Infinite Loop, Cupertino 95014';
const cityZipCodeRegex = /^[^,\\]+[,\\\s]+(.+?)\s*(\d{5})?$/;
const [_, city, zipCode] = address.match(cityZipCodeRegex) || [];
saveCityZipCode(city, zipCode);
```

### 避免映射心理

显示的说明要比隐式的更好

**Bad:**

```js
const locations = ['Austin', 'New York', 'San Francisco'];
locations.forEach((l) => {
  doStuff();
  doSomeOtherStuff();
  // ...
  // ...
  // ...
  // 较长的逻辑处理之后，已经不太能理解这个 l 是什么意思
  dispatch(l);
});
```

**Good:**

```js
const locations = ['Austin', 'New York', 'San Francisco'];
locations.forEach((location) => {
  doStuff();
  doSomeOtherStuff();
  // ...
  // ...
  // ...
  dispatch(location);
});
```

tip: 这个原则涉及的场景经常是我们在使用遍历或者管道函数处理数据的时候遇到。

### 不要添加不需要的上下文

如果我们在声明**对象/类**已经明确了语义，那就不要在**属性/成员变量**中重复声明了

**Bad:**

```js
const Car = {
  carMake: 'Honda',
  carModel: 'Accord',
  carColor: 'Blue',
};

function paintCar(car) {
  car.carColor = 'Red';
}
```

**Good:**

```js
const Car = {
  make: 'Honda',
  model: 'Accord',
  color: 'Blue',
};

function paintCar(car) {
  car.color = 'Red';
}
```

### 使用默认参数替代短路语句或者条件判断

默认参数看起来要比短路更加简洁。但是有一点要注意，如果使用默认参数，函数将只给未定义的参数提供默认值，其他假值 （如“”、“”、false、null、0 和 NaN）将不会被默认值替换

**Bad:**

```js
function createMicrobrewery(name) {
  const breweryName = name || 'Hipster Brew Co.';
  // ...
}
```

**Good:**

```js
function createMicrobrewery(name = 'Hipster Brew Co.') {
  // ...
}
```

## 函数

### 函数参数(要求 2 个或者以下)

限制函数参数的数量是非常重要的，因为它使测试函数时更加容易。如果函数参数超过 3 个，基本测试人员就要疯了，因为必须为每个独立的参数提供大量不同的场景。

1 个或 2 个参数是最理性的情况，要尽量避免参数达到 3 个。除此之外的任何东西都应该合并。通常，如果有两个以上的参数，说明函数要处理的逻辑太多(这里的建议是拆分函数)。如果不是上述情况，一般情况下，用一个更高级别的对象作为一个参数就足够了。

由于 JavaScript 允许我们动态地生成对象，不需要大量的类样板文件(这里暗指诸如 java 的强类型语言)，因此如果我们发现自己需要很多参数，可以直接用对象替代。

为了使函数期望的属性更加明显，可以使用 ES2015/ES6 解构语法，直接在声明参数时解构对象参数。这么做有几个优点：

1. 但有人阅读函数参数时，可以理解清楚地看到正在使用哪些属性。
2. 可以用来模拟命名参数
3. 结构还会克隆传递给函数的参数对象的指定原数值，有助于防止副作用。
4. eslint 可以检查到未使用的参数。这是不解构看不到的效果。

**Bad:**

```js
function createMenu(title, body, buttonText, cancellable) {
  // ...
}

createMenu('Foo', 'Bar', 'Baz', true);
```

**Good:**

```js
function createMenu({ title, body, buttonText, cancellable }) {
  // ...
}

createMenu({
  title: 'Foo',
  body: 'Bar',
  buttonText: 'Baz',
  cancellable: true,
});
```

### 一个函数应该只做一件事情

这一条就是大名鼎鼎的 **单一职责原则(Single Responsibility Principle)**，平常可以简称 **SRP**。

这是软件工程中最重要的原则。当函数做不止一件事情时，他们就更难组合、测试和推理。当我们能将一个函数分离成一个操作时，代码会更容易重构，读起来也会更加简洁明了。只此一条，掌握这个原则就足以让我们领先于大多数的开发人员。

**bad:**

```js
function emailClients(clients) {
  clients.forEach((client) => {
    const clientRecord = database.lookup(client);
    if (clientRecord.isActive()) {
      email(client);
    }
  });
}
```

**Good:**

```js
function emailActiveClients(clients) {
  clients.filter(isActiveClient).forEach(email);
}

function isActiveClient(client) {
  const clientRecord = database.lookup(client);
  return clientRecord.isActive();
}
```

### 函数名跟处理逻辑保持一致

**bad:**

```js
function addToDate(date, month) {
  // ...
}

const date = new Date();

// 调用的时候很难理解参数代表的实际含义
addToDate(date, 1);
```

**Good:**

```js
function addMonthToDate(month, date) {
  // ...
}

const date = new Date();
addMonthToDate(1, date);
```

### 函数仅仅是一个层次的抽象

当函数有一个以上的抽象层次时，通常说明功能做的太多了。拆分函数可以提高重用性和可测试性。

**Bad:**

```js
function parseBetterJSAlternative(code) {
  const REGEXES = [
    // ...
  ];

  const statements = code.split(' ');
  const tokens = [];
  REGEXES.forEach((REGEX) => {
    statements.forEach((statement) => {
      // ...
    });
  });

  const ast = [];
  tokens.forEach((token) => {
    // lex...
  });

  ast.forEach((node) => {
    // parse...
  });
}
```

**Good:**

```js
function parseBetterJSAlternative(code) {
  const tokens = tokenize(code);
  const syntaxTree = parse(tokens);
  syntaxTree.forEach((node) => {
    // parse...
  });
}

function tokenize(code) {
  const REGEXES = [
    // ...
  ];

  const statements = code.split(' ');
  const tokens = [];
  REGEXES.forEach((REGEX) => {
    statements.forEach((statement) => {
      tokens.push(/* ... */);
    });
  });

  return tokens;
}

function parse(tokens) {
  const syntaxTree = [];
  tokens.forEach((token) => {
    syntaxTree.push(/* ... */);
  });

  return syntaxTree;
}
```

### 删除重复代码

尽最大努力避免重复代码。重复代码的缺点是：如果要改动某些逻辑，意味着有不止一个地方需要修改。这样维护变得艰难。

想象一下，如果你经营一家餐厅，你会记录你的存货：所有的西红柿、洋葱、大蒜、香料等等。如果你有多个清单，那么当做一道有西红柿的菜时，我们要把所有清单关于西红柿的部分修改。但如果我们只有一个清单，那么只要修改一个地方。

通常，如果有重复代码中，有很多共同点，也会伴随着两个或多个稍微不同的逻辑。这些差异迫使我们有两个或多个独立的函数来执行相同的任务。删除重复代码以为着创建一个抽象，该抽象可以只使用一个函数/模块/类来处理这组不同的事情。

正确地进行抽象是至关重要的，这就是为什么我们应该遵循“类”部分中列出的可靠原则。糟糕的抽象比重复代码更糟糕，所以要小心！说到这里，如果你能做一个好的抽象，就立马行动起来！不要重复自己的代码，否则你会发现自己随时更新多个地方，而只为了改变一件事。

**Bad:**

```js
function showDeveloperList(developers) {
  developers.forEach((developer) => {
    const expectedSalary = developer.calculateExpectedSalary();
    const experience = developer.getExperience();
    const githubLink = developer.getGithubLink();
    const data = {
      expectedSalary,
      experience,
      githubLink,
    };

    render(data);
  });
}

function showManagerList(managers) {
  managers.forEach((manager) => {
    const expectedSalary = manager.calculateExpectedSalary();
    const experience = manager.getExperience();
    const portfolio = manager.getMBAProjects();
    const data = {
      expectedSalary,
      experience,
      portfolio,
    };

    render(data);
  });
}
```

**Good:**

```js
function showEmployeeList(employees) {
  employees.forEach((employee) => {
    const expectedSalary = employee.calculateExpectedSalary();
    const experience = employee.getExperience();

    const data = {
      expectedSalary,
      experience,
    };

    switch (employee.type) {
      case 'manager':
        data.portfolio = employee.getMBAProjects();
        break;
      case 'developer':
        data.githubLink = employee.getGithubLink();
        break;
    }

    render(data);
  });
}
```

### 使用 Object.assign 重置默认对象

**Bad:**

```js
const menuConfig = {
  title: null,
  body: 'Bar',
  buttonText: null,
  cancellable: true,
};

function createMenu(config) {
  config.title = config.title || 'Foo';
  config.body = config.body || 'Bar';
  config.buttonText = config.buttonText || 'Baz';
  config.cancellable =
    config.cancellable !== undefined ? config.cancellable : true;
}

createMenu(menuConfig);
```

**Good:**

```js
const menuConfig = {
  title: 'Order',
  // User did not include 'body' key
  buttonText: 'Send',
  cancellable: true,
};

function createMenu(config) {
  let finalConfig = Object.assign(
    {
      title: 'Foo',
      body: 'Bar',
      buttonText: 'Baz',
      cancellable: true,
    },
    config
  );
  return finalConfig;
  // config now equals: {title: "Order", body: "Bar", buttonText: "Send", cancellable: true}
  // ...
}

createMenu(menuConfig);
```

### 不要在函数参数中使用标记

一旦使用标记，就是告诉用户这个函数做了不止一件事情，这明显违背了 SRP 原则。如果函数遵循基于布尔值的不同代码路径，就把它拆分一下。

**Bad:**

```js
function createFile(name, temp) {
  if (temp) {
    fs.create(`./temp/${name}`);
  } else {
    fs.create(name);
  }
}
```

**Good:**

```js
function createFile(name) {
  fs.create(name);
}

function createTempFile(name) {
  createFile(`./temp/${name}`);
}
```

### 避免副作用(1)

如果函数接受相同一个参数，每次运行之后返回不同的值，这就叫副作用。比较典型的副作用是写入一个文件，修改一些全局变量，或者不小心把你所有的钱都汇给了一个陌生人。

项目中存在一些副作用是无法避免的，如上面举得写文件的例子，又或者是调用接口。应对这个问题的办法是：集中精力关注你要做的事情，不要有几个函数和类可以写入一个特定的文件。要注意只有一个服务可以做这件事情，有且仅有这一个。

这样做可以避免一些常见的陷阱，比如在没有任何结构的对象之间共享状态，使用任何东西都可以写入的可变数据类型，以及不要集中在副作用发生的地方。如果你能做到这一点，你会比绝大多数其他程序员更快乐。

**Bad:**

```js
// Global variable referenced by following function.
// If we had another function that used this name, now it'd be an array and it could break it.
let name = 'Ryan McDermott';

function splitIntoFirstAndLastName() {
  name = name.split(' ');
}

splitIntoFirstAndLastName();

console.log(name); // ['Ryan', 'McDermott'];
```

**Good:**

```js
function splitIntoFirstAndLastName(name) {
  return name.split(' ');
}

const name = 'Ryan McDermott';
const newName = splitIntoFirstAndLastName(name);

console.log(name); // 'Ryan McDermott';
console.log(newName); // ['Ryan', 'McDermott'];
```

### 避免副作用(2)

在 JavaScript 中，原始值通过值传递，对象、数组等引用对象是通过引用传递的。在对象和数组的情况下，如果有函数对购物车数组进行了更改，例如，通过添加要购买的项目，则使用该购物车数组的任何其他函数都将受到这个添加操作的影响。这也许是好事，但也可能让事情更糟糕。让我们想象一个糟糕的情况：

用户单击 “购买” 按钮，这个按钮调用一个 purchase 函数，生成网络请求并将 cart 数组发送到服务器。由于网络连接不好，购买函数必须不断地重复请求。现在，如果在网络请求开始之前，用户不小心点击了一个他们实际上并不想要的项目上的“添加到购物车”按钮呢？如果发生这种情况并且网络请求开始，那么该购买函数将发送意外添加的项，因为它引用了 addItemToCart 函数通过添加不需要的项来修改购物车数组。

一个很好的解决方案是让 addItemToCart 始终克隆购物车，编辑它，然后然后返回克隆。这样可以确保其他保存购物车引用的函数不会受到任何更改的影响。

对于这种方法，有两个注意事项：

1. 在某些情况，你可能需要修改输入对象，但是当你采用这种编程实践时，你会发现这种情况非常罕见。大多数东西都可以重构，没有副作用！
2. 就性能而言，克隆大对象可能开发非常大。幸运的是，这在实践中并不是一个大问题，因为有很多很好的库让这种编程方法快速进行，而不像手动克隆对象和数组那样占用内存。

**Bad:**

```js
const addItemToCart = (cart, item) => {
  cart.push({ item, date: Date.now() });
};
```

**Good:**

```js
const addItemToCart = (cart, item) => {
  return [...cart, { item, date: Date.now() }];
};
```

### 不要重写全局函数

在 JavaScript 中污染全局变量是一种不好的做法，因为你可能会与另一个库发生冲突，并且您的 API 用户在生产中遇到异常之前可能一直无法发现这个问题。让我们考虑一个例子：如果你想扩展 JavaScript 的本地数组方法，使它拥有一个能够显示两个数组之间差异的 diff 方法，该怎么办？你可以将新函数写入到数组原型上，但它很有可能与另一个试图做这件事情的库发生冲突。如果另一个库只是使用 diff 来查找数组的第一个元素和最后一个元素之间的差异呢？这就是为什么只使用 ES2015/ES6 类通过简单的继承全局 Array 对象解决这个问题。

**Bad:**

```js
Array.prototype.diff = function diff(comparisonArray) {
  const hash = new Set(comparisonArray);
  return this.filter((elem) => !hash.has(elem));
};
```

**Good:**

```js
class SuperArray extends Array {
  diff(comparisonArray) {
    const hash = new Set(comparisonArray);
    return this.filter((elem) => !hash.has(elem));
  }
}
```

### 拥抱函数式编程，避免命令式编程

JavaScript 不像 Haskell 那样是一种纯的函数式语言，但它有一种函数式的味道，支持函数式编程。函数式编程可以更简洁、更易于测试。尽可能地在代码中使用这种编程风格，代码质量会有大的提升。

**Bad:**

```js
const programmerOutput = [
  {
    name: 'Uncle Bobby',
    linesOfCode: 500,
  },
  {
    name: 'Suzie Q',
    linesOfCode: 1500,
  },
  {
    name: 'Jimmy Gosling',
    linesOfCode: 150,
  },
  {
    name: 'Gracie Hopper',
    linesOfCode: 1000,
  },
];

let totalOutput = 0;

for (let i = 0; i < programmerOutput.length; i++) {
  totalOutput += programmerOutput[i].linesOfCode;
}
```

**Good:**

```js
const programmerOutput = [
  {
    name: 'Uncle Bobby',
    linesOfCode: 500,
  },
  {
    name: 'Suzie Q',
    linesOfCode: 1500,
  },
  {
    name: 'Jimmy Gosling',
    linesOfCode: 150,
  },
  {
    name: 'Gracie Hopper',
    linesOfCode: 1000,
  },
];

const totalOutput = programmerOutput.reduce(
  (totalLines, output) => totalLines + output.linesOfCode,
  0
);
```

### 封装条件语句

**Bad:**

```js
if (fsm.state === 'fetching' && isEmpty(listNode)) {
  // ...
}
```

**Good:**

```js
function shouldShowSpinner(fsm, listNode) {
  return fsm.state === 'fetching' && isEmpty(listNode);
}

if (shouldShowSpinner(fsmInstance, listNodeInstance)) {
  // ...
}
```

### 避免否定条件语句

**Bad:**

```js
function isDOMNodeNotPresent(node) {
  // ...
}

if (!isDOMNodeNotPresent(node)) {
  // ...
}
```

**Good:**

```js
function isDOMNodePresent(node) {
  // ...
}

if (isDOMNodePresent(node)) {
  // ...
}
```

### 避免条件语句，以多态取代条件判断

看起来，这似乎是一个不可能的事情，是不是？大多数人第一次听到这个，可能也会困惑：没有 if 语句，我该怎么办？答案是，在许多情况下，可以使用多态来实现相同的任务。那么随之而来的第二个问题是：为什么要这么做？答案就在我们之前学到一个整洁代码原则：一个函数只应该做一件事情。当你的类和函数有 if 语句时，你告诉你的用户你的函数做了不止一件事。时刻记住，一个函数只做一件事！

> tips: JavaScript 有函数式语言的味道，同样也支持面向对象编程。一起回顾面向对象编程范式三大特性：封装、继承、多态。

**Bad:**

```js
class Airplane {
  // ...
  getCruisingAltitude() {
    switch (this.type) {
      case '777':
        return this.getMaxAltitude() - this.getPassengerCount();
      case 'Air Force One':
        return this.getMaxAltitude();
      case 'Cessna':
        return this.getMaxAltitude() - this.getFuelExpenditure();
    }
  }
}
```

**Good:**

```
class Airplane {
  // ...
}

class Boeing777 extends Airplane {
  // ...
  getCruisingAltitude() {
    return this.getMaxAltitude() - this.getPassengerCount();
  }
}

class AirForceOne extends Airplane {
  // ...
  getCruisingAltitude() {
    return this.getMaxAltitude();
  }
}

class Cessna extends Airplane {
  // ...
  getCruisingAltitude() {
    return this.getMaxAltitude() - this.getFuelExpenditure();
  }
}
```

### 避免类型检查(1)

JavaScript 是弱类型语言已经是人尽皆知了，这意味着我们的函数可以接受任何类型的参数。有时我们会被这种自由伤害到，因此通常我们选择了在函数中进行类型检查。但是有很多方法可以避免这样做。首要考虑的是一致的 api。

**Bad:**

```js
function travelToTexas(vehicle) {
  if (vehicle instanceof Bicycle) {
    vehicle.pedal(this.currentLocation, new Location('texas'));
  } else if (vehicle instanceof Car) {
    vehicle.drive(this.currentLocation, new Location('texas'));
  }
}
```

**Good:**

```js
function travelToTexas(vehicle) {
  vehicle.move(this.currentLocation, new Location('texas'));
}
```

### 避免类型检查(2)

如果你正在处理字符串和整数等基本类型，并且不能使用多态，但仍然需要进行类型检查，可以考虑使用 Typescript。它是普通 JavaScript 的一个很好的替代品。因为它在标准 JavaScript 语法之上为我们提供了静态类型。普通 JavaScript 手工类型检查的问题在于，要做好它需要大量额外的措施，以至于我们得到的伪“类型安全”并不能弥补失去的可读性。保持 JavaScript 的整洁，编写好的测试，并进行良好的代码评审。否则，只需要 TypeScript！(这是一个很好的替代品！)

**Bad:**

```js
function combine(val1, val2) {
  if (
    (typeof val1 === 'number' && typeof val2 === 'number') ||
    (typeof val1 === 'string' && typeof val2 === 'string')
  ) {
    return val1 + val2;
  }

  throw new Error('Must be of type String or Number');
}
```

**Good:**

```js
function combine(val1, val2) {
  return val1 + val2;
}
```

or

```ts
function combineString(val1: string, val2: string): string {
  return val1 + val2;
}

function combineNumber(val1: number, val2: number): number {
  return val1 + val2;
}
```

### 不要过度优化

现代浏览器在运行时会进行大量的优化。很多时候，如果你在优化，那么只是在浪费时间。不如把这些资源用在那些真正缺少优化的地方。瞄准那些地方，直到它们被优化好为止。

**Bad:**
``` js
// On old browsers, each iteration with uncached `list.length` would be costly
// because of `list.length` recomputation. In modern browsers, this is optimized.
for (let i = 0, len = list.length; i < len; i++) {
  // ...
}
```

**Good:**
``` js
for (let i = 0; i < list.length; i++) {
  // ...
}
```

### 移除死代码

死代码和重复代码一样糟糕。把它放在代码库中没有任何理由。如果没有人用它，就把它扔了！如果后面仍然需要它，它在版本历史记录中仍然可以找到。

**Bad:**
``` js
function oldRequestModule(url) {
  // ...
}

function newRequestModule(url) {
  // ...
}

const req = newRequestModule;
inventoryTracker("apples", req, "www.inventory-awesome.io");
```

**Good:**
``` js
function newRequestModule(url) {
  // ...
}

const req = newRequestModule;
inventoryTracker("apples", req, "www.inventory-awesome.io");
```

## 对象和数据结构

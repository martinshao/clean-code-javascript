// https://juejin.im/post/6844904030221631495

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